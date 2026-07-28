'use client';

import { GraphNode, GraphLink } from '@/app/lib/models/graph';

interface PathSidebarProps {
  pathNodes: GraphNode[];
  pathLinks: GraphLink[];
  onClose: () => void;
  onSelectNode: (node: GraphNode) => void;
  onPinPath: () => void;
}

export default function PathSidebar({
  pathNodes,
  pathLinks,
  onClose,
  onSelectNode,
  onPinPath
}: PathSidebarProps) {
  if (pathNodes.length === 0) {
    return (
      <div className="h-full flex flex-col bg-background border-l p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">Pathfinder</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="flex-1 flex items-center justify-center text-center p-4">
          <div>
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-muted-foreground font-medium">No Path Found</p>
            <p className="text-xs text-muted-foreground mt-1">There are no direct or indirect connections between these two nodes in the current view.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background border-l overflow-hidden">
      <div className="p-4 border-b bg-muted/50 flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <span>🗺️</span> Shortest Path ({pathLinks.length} hop{pathLinks.length === 1 ? '' : 's'})
          </h3>
          <p className="text-xs text-muted-foreground">
            From {pathNodes[0]?.label} to {pathNodes[pathNodes.length - 1]?.label}
          </p>
        </div>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground rounded">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {pathNodes.map((node, index) => {
          const link = pathLinks[index];
          return (
            <div key={node.id} className="relative">
              {/* Step Node */}
              <div 
                onClick={() => onSelectNode(node)}
                className="p-3 bg-card border border-border rounded-lg hover:border-primary cursor-pointer transition-all flex items-center gap-3"
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: node.color || '#6B7280' }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{node.label}</p>
                  <p className="text-xs text-muted-foreground capitalize">{node.type} • {node.group}</p>
                </div>
                <span className="text-xs text-muted-foreground font-mono">#{index + 1}</span>
              </div>

              {/* Link Connector */}
              {link && (
                <div className="py-2 px-6 flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-0.5 h-4 bg-border ml-1.5" />
                  <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground font-mono text-[11px]">
                    ↓ {link.label || link.type || 'connected to'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t bg-muted/50 flex gap-2">
        <button
          onClick={onPinPath}
          className="flex-1 py-2 px-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-xs font-medium transition-colors"
        >
          📌 Pin All Nodes in Path
        </button>
        <button
          onClick={onClose}
          className="py-2 px-3 bg-muted hover:bg-muted/80 text-foreground rounded-md text-xs font-medium transition-colors"
        >
          Clear Path
        </button>
      </div>
    </div>
  );
}
