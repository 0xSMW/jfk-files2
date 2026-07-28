'use client';

import React, { useMemo, useState } from 'react';
import { GraphData, GraphNode } from '@/app/lib/models/graph';

interface TimelineViewProps {
  graphData: GraphData;
  onNodeClick: (node: GraphNode) => void;
  selectedNode: GraphNode | null;
}

export default function TimelineView({
  graphData,
  onNodeClick,
  selectedNode
}: TimelineViewProps) {
  const [selectedAgency, setSelectedAgency] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract documents with dates
  const timelineData = useMemo(() => {
    const docNodes = graphData.nodes.filter(n => n.type === 'document');

    const parsed = docNodes.map(node => {
      const doc = node.metadata || {};
      const rawDate = doc.date || '';
      let timestamp = 0;

      if (rawDate && /^\d{4}/.test(rawDate)) {
        const match = rawDate.match(/^(\d{4})(-(\d{2}))?(-(\d{2}))?/);
        if (match) {
          const year = parseInt(match[1], 10);
          const month = match[3] ? parseInt(match[3], 10) - 1 : 0;
          const day = match[5] ? parseInt(match[5], 10) : 1;
          timestamp = new Date(year, month, day).getTime();
        }
      }

      return {
        node,
        dateStr: rawDate || 'Unknown',
        timestamp,
        year: timestamp ? new Date(timestamp).getFullYear() : null,
        agency: doc.origin_agency || 'Unknown Agency',
        type: doc.document_type || 'Document'
      };
    }).filter(d => d.timestamp > 0);

    parsed.sort((a, b) => a.timestamp - b.timestamp);

    return parsed;
  }, [graphData.nodes]);

  // Filtered timeline data
  const filteredData = useMemo(() => {
    return timelineData.filter(d => {
      if (selectedAgency !== 'all' && d.agency !== selectedAgency) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          d.node.label.toLowerCase().includes(q) ||
          d.agency.toLowerCase().includes(q) ||
          d.type.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [timelineData, selectedAgency, searchQuery]);

  // Agencies list
  const agencies = useMemo(() => {
    const set = new Set<string>();
    timelineData.forEach(d => set.add(d.agency));
    return Array.from(set);
  }, [timelineData]);

  // Min/Max dates for positioning
  const { minTime, maxTime, timeSpan } = useMemo(() => {
    if (filteredData.length === 0) return { minTime: 0, maxTime: 0, timeSpan: 1 };
    const min = filteredData[0].timestamp;
    const max = filteredData[filteredData.length - 1].timestamp;
    return { minTime: min, maxTime: max, timeSpan: Math.max(max - min, 86400000) };
  }, [filteredData]);

  // Group by year for visual sections
  const yearGroups = useMemo(() => {
    const groups = new Map<number, typeof filteredData>();
    filteredData.forEach(item => {
      if (item.year) {
        if (!groups.has(item.year)) groups.set(item.year, []);
        groups.get(item.year)!.push(item);
      }
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a - b);
  }, [filteredData]);

  return (
    <div className="h-full flex flex-col bg-muted/50 overflow-hidden">
      {/* Timeline Controls Header */}
      <div className="p-4 bg-background border-b flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span>📅</span> Chronological Document Timeline
          </h2>
          <p className="text-xs text-muted-foreground">
            Showing {filteredData.length} dated documents across history
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="Filter timeline documents..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 border rounded-md text-xs w-48 focus:ring-2 focus:ring-ring focus:outline-none"
          />

          <select
            value={selectedAgency}
            onChange={e => setSelectedAgency(e.target.value)}
            className="px-3 py-1.5 border rounded-md text-xs bg-background focus:ring-2 focus:ring-ring focus:outline-none"
          >
            <option value="all">All Agencies ({agencies.length})</option>
            {agencies.map(agency => (
              <option key={agency} value={agency}>{agency}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Timeline View */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-center">
            <div>
              <div className="text-4xl mb-2">🗓️</div>
              <p className="text-muted-foreground font-medium">No Dated Documents Match Your Filter</p>
              <p className="text-xs text-muted-foreground mt-1">Try resetting search or agency filters</p>
            </div>
          </div>
        ) : (
          yearGroups.map(([year, items]) => (
            <div key={year} className="relative pl-6 border-l-2 border-primary space-y-3">
              {/* Year Marker */}
              <div className="absolute -left-3 top-0 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                {year}
              </div>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map(({ node, dateStr, agency, type }) => {
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <div
                      key={node.id}
                      onClick={() => onNodeClick(node)}
                      className={`p-3 rounded-lg border bg-card cursor-pointer transition-all ${
                        isSelected ? 'border-primary ring-2 ring-ring/20 bg-primary/5' : 'border-border hover:border-primary'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {dateStr}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {agency}
                        </span>
                      </div>
                      <h4 className="text-xs font-medium text-foreground line-clamp-2 mb-2">
                        {node.label}
                      </h4>
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-2 border-t border-border">
                        <span className="flex items-center gap-1">
                          <span 
                            className="w-2 h-2 rounded-full inline-block" 
                            style={{ backgroundColor: node.color || '#6B7280' }} 
                          />
                          {type}
                        </span>
                        <span>Click to view details →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
