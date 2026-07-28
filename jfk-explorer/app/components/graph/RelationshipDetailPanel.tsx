'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { GraphData, GraphNode, GraphLink } from '@/app/lib/models/graph';
import { Document } from '@/app/lib/models/document';
import { Entity } from '@/app/lib/models/entity';
import { Annotation, FlagType, FLAG_CONFIGS } from '@/app/lib/utils/annotation-system';

interface RelationshipDetailPanelProps {
  selectedNode: GraphNode | null;
  graphData: GraphData;
  onClose: () => void;
  onNodeSelect: (node: GraphNode) => void;
  onFocus?: (node: GraphNode) => void;
  inFocusMode?: boolean;
  onPinNode?: (node: GraphNode) => void;
  isPinned?: boolean;
  onStartPathFinding?: (node: GraphNode) => void;
  annotations?: Annotation[];
  onAddAnnotation?: (nodeId: string, nodeLabel: string, text: string, flag?: FlagType) => void;
  onDeleteAnnotation?: (id: string) => void;
}

export default function RelationshipDetailPanel({
  selectedNode,
  graphData,
  onClose,
  onNodeSelect,
  onFocus,
  inFocusMode = false,
  onPinNode,
  isPinned = false,
  onStartPathFinding,
  annotations = [],
  onAddAnnotation,
  onDeleteAnnotation
}: RelationshipDetailPanelProps) {
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedFlag, setSelectedFlag] = useState<FlagType | undefined>(undefined);
  const [showNoteForm, setShowNoteForm] = useState(false);

  // Group connected nodes by link relationship type
  const connectedGroups = useMemo(() => {
    if (!selectedNode) return {};

    const groups: Record<string, Array<{ node: GraphNode; link: GraphLink }>> = {};

    graphData.links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;

      if (sourceId === selectedNode.id || targetId === selectedNode.id) {
        const otherId = sourceId === selectedNode.id ? targetId : sourceId;
        const otherNode = graphData.nodes.find(n => n.id === otherId);
        if (otherNode) {
          const relType = link.type || link.label || 'connected to';
          if (!groups[relType]) groups[relType] = [];
          groups[relType].push({ node: otherNode, link });
        }
      }
    });

    return groups;
  }, [selectedNode, graphData]);

  if (!selectedNode) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Select a node in the graph to view details</p>
      </div>
    );
  }

  const isDocument = selectedNode.type === 'document';
  const isEntity = selectedNode.type === 'entity';
  const metadata = (selectedNode.metadata || {}) as (Document & Entity & Record<string, any>);

  const nodeAnnotations = annotations.filter(a => a.nodeId === selectedNode.id);

  const securityLevel = metadata.security_level || metadata.classification;

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden border-l border-border">
      {/* Header */}
      <div className="p-4 border-b bg-muted/50 flex justify-between items-start">
        <div className="min-w-0 flex-1 pr-2">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0 inline-block"
              style={{ backgroundColor: selectedNode.color || '#6B7280' }}
            />
            <h3 className="text-base font-bold text-foreground truncate">
              {selectedNode.label}
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-foreground">
              {selectedNode.group || selectedNode.type}
            </span>

            {securityLevel && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                securityLevel.includes('SECRET') ? 'bg-destructive/10 text-destructive' : 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400'
              }`}>
                🔒 {securityLevel}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground p-1 rounded"
          aria-label="Close detail panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Document Metadata Section */}
        {isDocument && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs bg-muted/50 p-2.5 rounded-lg border">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Date</span>
                <span className="font-semibold text-foreground">{metadata.date || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Agency</span>
                <span className="font-semibold text-foreground">{metadata.origin_agency || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Sender</span>
                <span className="font-medium text-foreground truncate block">{metadata.sender || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Recipient</span>
                <span className="font-medium text-foreground truncate block">{metadata.recipient || 'N/A'}</span>
              </div>
            </div>

            {metadata.summary_one_paragraph && (
              <div>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Summary</h4>
                <p className="text-xs text-foreground leading-relaxed bg-primary/5 p-2.5 rounded-md border border-primary/20">
                  {metadata.summary_one_paragraph}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Entity Metadata Section */}
        {isEntity && (
          <div className="space-y-3">
            {metadata.summary && (
              <div>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Summary</h4>
                <p className="text-xs text-foreground leading-relaxed bg-purple-500/5 p-2.5 rounded-md border border-purple-500/20">
                  {metadata.summary}
                </p>
              </div>
            )}

            {metadata.significance && (
              <div>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Historical Significance</h4>
                <p className="text-xs text-foreground leading-relaxed bg-muted/50 p-2.5 rounded-md border">
                  {metadata.significance}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Connected Nodes Grouped by Link Type */}
        <div>
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
            Network Connections ({Object.values(connectedGroups).reduce((acc, g) => acc + g.length, 0)})
          </h4>

          {Object.keys(connectedGroups).length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2">No connections visible in current graph</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(connectedGroups).map(([relType, items]) => (
                <div key={relType} className="border rounded-md overflow-hidden">
                  <div className="bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground capitalize flex justify-between">
                    <span>{relType}</span>
                    <span className="bg-muted px-1.5 rounded text-[10px]">{items.length}</span>
                  </div>
                  <div className="divide-y divide-border max-h-40 overflow-y-auto">
                    {items.map(({ node }, idx) => (
                      <button
                        key={`${node.id}-${idx}`}
                        onClick={() => onNodeSelect(node)}
                        className="w-full text-left p-2 hover:bg-primary/10 transition-colors flex items-center gap-2 text-xs"
                      >
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: node.color || '#6B7280' }} />
                        <span className="truncate flex-1 font-medium text-foreground">{node.label}</span>
                        <span className="text-[10px] text-muted-foreground capitalize">{node.type}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes & Annotations Section */}
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Notes ({nodeAnnotations.length})
            </h4>
            <button
              onClick={() => setShowNoteForm(!showNoteForm)}
              className="text-xs text-primary hover:underline font-medium"
            >
              {showNoteForm ? 'Cancel' : '+ Add Note'}
            </button>
          </div>

          {showNoteForm && onAddAnnotation && (
            <div className="p-3 border rounded-lg bg-muted/50 space-y-2 mb-3">
              <textarea
                placeholder="Enter investigation note..."
                value={newNoteText}
                onChange={e => setNewNoteText(e.target.value)}
                className="w-full p-2 text-xs border rounded bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                rows={3}
              />
              <div className="flex justify-between items-center">
                <select
                  value={selectedFlag || ''}
                  onChange={e => setSelectedFlag((e.target.value as FlagType) || undefined)}
                  className="text-xs border rounded p-1 bg-background"
                >
                  <option value="">No Flag</option>
                  {Object.entries(FLAG_CONFIGS).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (newNoteText.trim()) {
                      onAddAnnotation(selectedNode.id, selectedNode.label, newNoteText.trim(), selectedFlag);
                      setNewNoteText('');
                      setSelectedFlag(undefined);
                      setShowNoteForm(false);
                    }
                  }}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90"
                >
                  Save Note
                </button>
              </div>
            </div>
          )}

          {nodeAnnotations.map(note => (
            <div key={note.id} className="p-2.5 border rounded bg-muted/50 text-xs mb-2 relative">
              <p className="text-foreground whitespace-pre-wrap">{note.text}</p>
              <div className="flex justify-between items-center mt-2 text-[10px] text-muted-foreground">
                <span>{new Date(note.createdAt).toLocaleTimeString()}</span>
                {onDeleteAnnotation && (
                  <button onClick={() => onDeleteAnnotation(note.id)} className="text-destructive hover:underline">
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action Footer Buttons */}
      <div className="p-3 border-t bg-muted/50 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {onPinNode && (
            <button
              onClick={() => onPinNode(selectedNode)}
              className={`py-1.5 px-2 text-xs rounded font-medium border transition-colors flex items-center justify-center gap-1 ${
                isPinned ? 'bg-primary/10 text-primary border-primary' : 'bg-background hover:bg-muted text-foreground border-border'
              }`}
            >
              <span>📌</span> {isPinned ? 'Pinned' : 'Pin Node'}
            </button>
          )}

          {onStartPathFinding && (
            <button
              onClick={() => onStartPathFinding(selectedNode)}
              className="py-1.5 px-2 bg-background hover:bg-muted text-foreground border border-border rounded text-xs font-medium transition-colors flex items-center justify-center gap-1"
            >
              <span>🗺️</span> Find Path
            </button>
          )}
        </div>

        {isDocument && (
          <Link
            href={`/documents/${selectedNode.docId || selectedNode.id.replace(/^doc-/, '')}`}
            className="w-full py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-xs font-semibold text-center block transition-colors"
          >
            Open Full Document →
          </Link>
        )}

        {isEntity && (selectedNode.slug || metadata.slug) && (
          <Link
            href={`/entities/${selectedNode.slug || metadata.slug}`}
            className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold text-center block transition-colors"
          >
            View Entity Detail →
          </Link>
        )}
      </div>
    </div>
  );
}