'use client';

import React, { useState } from 'react';
import { GraphFilterOptions, GraphNode } from '@/app/lib/models/graph';
import { InvestigationSession } from '@/app/lib/utils/investigation-store';
import { Annotation, FLAG_CONFIGS } from '@/app/lib/utils/annotation-system';

interface InvestigateSidebarProps {
  filterOptions: GraphFilterOptions;
  onFilterChange: (filters: Partial<GraphFilterOptions>) => void;
  graphStats: { documentCount: number; entityCount: number; linkCount: number };
  totalStats: { totalDocuments: number; totalEntities: number } | null;
  pinnedNodes: GraphNode[];
  onUnpinNode: (nodeId: string) => void;
  onSelectNode: (node: GraphNode) => void;
  trail: GraphNode[];
  annotations: Annotation[];
  onDeleteAnnotation: (id: string) => void;
  sessions: InvestigationSession[];
  currentSession: InvestigationSession | null;
  onSelectSession: (session: InvestigationSession) => void;
  onCreateSession: (name: string) => void;
  onExportSession: () => void;
  onImportSession: (json: string) => void;
}

export default function InvestigateSidebar({
  filterOptions,
  onFilterChange,
  graphStats,
  totalStats,
  pinnedNodes,
  onUnpinNode,
  onSelectNode,
  trail,
  annotations,
  onDeleteAnnotation,
  sessions,
  currentSession,
  onSelectSession,
  onCreateSession,
  onExportSession,
  onImportSession
}: InvestigateSidebarProps) {
  const [activeTab, setActiveTab] = useState<'filters' | 'pinned' | 'trail' | 'notes' | 'sessions'>('filters');
  const [newSessionName, setNewSessionName] = useState('');
  const [showNewSessionInput, setShowNewSessionInput] = useState(false);

  const commonDocTypes = ['Report', 'Memorandum', 'Cable', 'Dispatch', 'Routing and Record Sheet', 'Letter'];
  const commonEntityTypes = ['person', 'organization', 'location', 'tag'];

  const handleDocTypeToggle = (type: string) => {
    const current = filterOptions.documentTypes || [];
    const updated = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
    onFilterChange({ documentTypes: updated });
  };

  const handleEntityTypeToggle = (type: string) => {
    const current = filterOptions.entityTypes || [];
    const updated = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
    onFilterChange({ entityTypes: updated });
  };

  return (
    <div className="w-80 bg-background border-r border-border h-full flex flex-col">
      {/* Sidebar Top Nav Tabs */}
      <div className="flex border-b border-border bg-muted/50 text-xs font-medium text-muted-foreground">
        <button
          onClick={() => setActiveTab('filters')}
          className={`flex-1 py-2.5 px-2 text-center border-b-2 transition-colors ${
            activeTab === 'filters' ? 'border-primary text-primary font-semibold bg-background' : 'border-transparent hover:text-foreground'
          }`}
        >
          🎛️ Filters
        </button>
        <button
          onClick={() => setActiveTab('pinned')}
          className={`flex-1 py-2.5 px-2 text-center border-b-2 transition-colors relative ${
            activeTab === 'pinned' ? 'border-primary text-primary font-semibold bg-background' : 'border-transparent hover:text-foreground'
          }`}
        >
          📌 Pins ({pinnedNodes.length})
        </button>
        <button
          onClick={() => setActiveTab('trail')}
          className={`flex-1 py-2.5 px-2 text-center border-b-2 transition-colors ${
            activeTab === 'trail' ? 'border-primary text-primary font-semibold bg-background' : 'border-transparent hover:text-foreground'
          }`}
        >
          🐾 Trail
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-2.5 px-2 text-center border-b-2 transition-colors ${
            activeTab === 'notes' ? 'border-primary text-primary font-semibold bg-background' : 'border-transparent hover:text-foreground'
          }`}
        >
          📝 Notes
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex-1 py-2.5 px-2 text-center border-b-2 transition-colors ${
            activeTab === 'sessions' ? 'border-primary text-primary font-semibold bg-background' : 'border-transparent hover:text-foreground'
          }`}
        >
          💾 Saved
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {activeTab === 'filters' && (
          <>
            {/* Search Bar */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Search Graph
              </label>
              <input
                type="text"
                placeholder="Search title, summary, or entity..."
                value={filterOptions.searchQuery || ''}
                onChange={e => onFilterChange({ searchQuery: e.target.value })}
                className="w-full p-2 border border-border rounded-md text-xs focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>

            {/* Max Nodes Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Max Rendered Nodes
                </label>
                <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {filterOptions.maxNodes || 100}
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={filterOptions.maxNodes || 100}
                onChange={e => onFilterChange({ maxNodes: parseInt(e.target.value, 10) })}
                className="w-full accent-primary"
              />
            </div>

            {/* Document Types */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Document Types
              </label>
              <div className="space-y-1.5">
                {commonDocTypes.map(type => {
                  const checked = (filterOptions.documentTypes || []).includes(type);
                  return (
                    <label key={type} className="flex items-center text-xs text-foreground hover:text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleDocTypeToggle(type)}
                        className="mr-2 rounded border-border text-primary focus:ring-ring"
                      />
                      <span>{type}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Entity Types */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Entity Types
              </label>
              <div className="space-y-1.5">
                {commonEntityTypes.map(type => {
                  const checked = (filterOptions.entityTypes || []).includes(type);
                  return (
                    <label key={type} className="flex items-center text-xs text-foreground capitalize hover:text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleEntityTypeToggle(type)}
                        className="mr-2 rounded border-border text-primary focus:ring-ring"
                      />
                      <span>{type}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Reset Filters */}
            <button
              onClick={() => onFilterChange({ documentTypes: [], entityTypes: [], searchQuery: '', maxNodes: 100 })}
              className="w-full py-1.5 px-3 bg-muted hover:bg-muted/80 text-foreground text-xs rounded-md font-medium transition-colors"
            >
              Reset All Filters
            </button>
          </>
        )}

        {activeTab === 'pinned' && (
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
              Pinned Investigation Nodes
            </h4>
            {pinnedNodes.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-6">
                No pinned nodes yet. Pin nodes from the detail panel to keep them visible across filter changes.
              </p>
            ) : (
              <div className="space-y-2">
                {pinnedNodes.map(node => (
                  <div key={node.id} className="p-2.5 border rounded-lg bg-muted/50 hover:bg-primary/5 flex justify-between items-center transition-colors">
                    <button
                      onClick={() => onSelectNode(node)}
                      className="text-left min-w-0 flex-1 mr-2"
                    >
                      <p className="text-xs font-medium text-foreground truncate">{node.label}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{node.type} • {node.group}</p>
                    </button>
                    <button
                      onClick={() => onUnpinNode(node.id)}
                      className="text-muted-foreground hover:text-destructive p-1 text-xs"
                      title="Unpin node"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'trail' && (
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
              Investigation Trail ({trail.length})
            </h4>
            {trail.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-6">
                Your exploration steps will be logged here chronologically.
              </p>
            ) : (
              <div className="space-y-2">
                {trail.map((node, index) => (
                  <div
                    key={`${node.id}-${index}`}
                    onClick={() => onSelectNode(node)}
                    className="p-2 border border-border rounded-md hover:border-primary cursor-pointer flex items-center gap-2 text-xs"
                  >
                    <span className="text-[10px] text-muted-foreground font-mono w-5 text-right">{index + 1}.</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{node.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
              Investigation Notes ({annotations.length})
            </h4>
            {annotations.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-6">
                No notes added yet. Add notes to nodes from the detail panel.
              </p>
            ) : (
              <div className="space-y-3">
                {annotations.map(note => {
                  const flagConfig = note.flag ? FLAG_CONFIGS[note.flag] : null;
                  return (
                    <div key={note.id} className="p-3 border rounded-lg bg-muted/50 text-xs relative">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-foreground truncate max-w-[160px]">
                          {note.nodeLabel}
                        </span>
                        {flagConfig && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${flagConfig.badgeBg} ${flagConfig.text}`}>
                            {flagConfig.label}
                          </span>
                        )}
                      </div>
                      <p className="text-foreground mt-1 whitespace-pre-wrap">{note.text}</p>
                      <div className="flex justify-between items-center mt-2 text-[10px] text-muted-foreground pt-1 border-t">
                        <span>{new Date(note.createdAt).toLocaleTimeString()}</span>
                        <button
                          onClick={() => onDeleteAnnotation(note.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Saved Sessions
              </h4>
              <button
                onClick={() => setShowNewSessionInput(!showNewSessionInput)}
                className="text-xs text-primary hover:underline font-medium"
              >
                + New Session
              </button>
            </div>

            {showNewSessionInput && (
              <div className="p-3 border rounded-lg bg-muted/50 space-y-2">
                <input
                  type="text"
                  placeholder="Session Name..."
                  value={newSessionName}
                  onChange={e => setNewSessionName(e.target.value)}
                  className="w-full p-1.5 text-xs border rounded bg-background"
                />
                <button
                  onClick={() => {
                    if (newSessionName.trim()) {
                      onCreateSession(newSessionName.trim());
                      setNewSessionName('');
                      setShowNewSessionInput(false);
                    }
                  }}
                  className="w-full py-1 bg-primary text-primary-foreground rounded text-xs font-medium"
                >
                  Create & Save
                </button>
              </div>
            )}

            <div className="space-y-2">
              {sessions.map(sess => (
                <div
                  key={sess.id}
                  onClick={() => onSelectSession(sess)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    currentSession?.id === sess.id ? 'border-primary bg-primary/5 ring-1 ring-ring' : 'hover:border-primary'
                  }`}
                >
                  <p className="text-xs font-bold text-foreground">{sess.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Updated {new Date(sess.updatedAt).toLocaleDateString()} • {sess.pinnedNodeIds?.length || 0} pins
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t flex gap-2">
              <button
                onClick={onExportSession}
                className="flex-1 py-1.5 border border-border hover:bg-muted/50 text-foreground text-xs rounded font-medium"
              >
                Export JSON
              </button>
              <label className="flex-1 py-1.5 border border-border hover:bg-muted/50 text-foreground text-xs rounded font-medium text-center cursor-pointer">
                Import JSON
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = ev => {
                        const content = ev.target?.result as string;
                        if (content) onImportSession(content);
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar Footer */}
      <div className="p-3 border-t bg-muted/50 text-[11px] text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground">
          Showing: 📄 {graphStats.documentCount} docs · 👤 {graphStats.entityCount} entities · 🔗 {graphStats.linkCount} links
        </p>
        {totalStats && (
          <p className="text-muted-foreground">
            Total Dataset: 📄 {totalStats.totalDocuments.toLocaleString()} docs · 👤 {totalStats.totalEntities.toLocaleString()} entities
          </p>
        )}
      </div>
    </div>
  );
}
