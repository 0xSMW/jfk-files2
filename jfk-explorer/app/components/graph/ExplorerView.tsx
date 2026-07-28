'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GraphData, GraphNode, GraphLink } from '@/app/lib/models/graph';
import { slugify } from '@/app/lib/utils/helpers';
import { DOCUMENT_COLORS, ENTITY_COLORS, LINK_COLORS } from '@/app/lib/utils/visualization-colors';
import RelationshipGraph from './RelationshipGraph';

interface ExplorerViewProps {
  initialRootNode?: GraphNode | null;
  onNodeClick: (node: GraphNode) => void;
  onPinNode?: (node: GraphNode) => void;
  onStartPathFinding?: (sourceNode: GraphNode) => void;
}

export default function ExplorerView({
  initialRootNode,
  onNodeClick,
  onPinNode,
  onStartPathFinding
}: ExplorerViewProps) {
  const [explorerData, setExplorerData] = useState<GraphData>({ nodes: [], links: [] });
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());
  const [loadingNodeId, setLoadingNodeId] = useState<string | null>(null);
  const initializedRootIdRef = useRef<string | null>(null);

  // Helper to expand node neighbors
  const expandNode = useCallback(async (node: GraphNode) => {
    setLoadingNodeId(node.id);

    try {
      const newNodes: GraphNode[] = [];
      const newLinks: GraphLink[] = [];

      if (node.type === 'document') {
        const docId = node.docId || node.id.replace(/^doc-/, '');
        const res = await fetch(`/api/graph/document/${encodeURIComponent(docId)}`);
        if (res.ok) {
          const docGraph: GraphData = await res.json();
          docGraph.nodes.forEach(n => {
            if (n.id !== node.id) newNodes.push(n);
          });
          docGraph.links.forEach(l => newLinks.push(l));
        }
      } else if (node.type === 'entity') {
        const entitySlug = node.slug || node.id.replace(/^entity-/, '');
        const res = await fetch(`/api/graph/entity/${encodeURIComponent(entitySlug)}`);
        if (res.ok) {
          const entityGraph: GraphData = await res.json();
          entityGraph.nodes.forEach(n => {
            if (n.id !== node.id) newNodes.push(n);
          });
          entityGraph.links.forEach(l => newLinks.push(l));
        }
      }

      setExplorerData(prev => {
        const nodeMap = new Map<string, GraphNode>();
        prev.nodes.forEach(n => nodeMap.set(n.id, n));
        newNodes.forEach(n => {
          if (!nodeMap.has(n.id)) nodeMap.set(n.id, n);
        });

        const linkSet = new Set<string>();
        const combinedLinks: GraphLink[] = [];

        [...prev.links, ...newLinks].forEach(l => {
          const s = typeof l.source === 'string' ? l.source : (l.source as any).id;
          const t = typeof l.target === 'string' ? l.target : (l.target as any).id;
          const key = `${s}->${t}`;
          if (!linkSet.has(key)) {
            linkSet.add(key);
            combinedLinks.push(l);
          }
        });

        return {
          nodes: Array.from(nodeMap.values()),
          links: combinedLinks
        };
      });

      setExpandedNodeIds(prev => new Set(prev).add(node.id));
    } catch (e) {
      console.error('Error expanding node:', e);
    } finally {
      setLoadingNodeId(null);
    }
  }, []);

  // Initialize graph with root node or default entity ONLY once per root ID
  useEffect(() => {
    async function initExplorer() {
      let root = initialRootNode;
      const targetId = root ? root.id : 'default-cia';

      if (initializedRootIdRef.current === targetId) {
        return; // Don't reset if already initialized for this root
      }

      if (!root) {
        root = {
          id: 'entity-central-intelligence-agency',
          label: 'Central Intelligence Agency',
          name: 'Central Intelligence Agency',
          type: 'entity',
          group: 'organization',
          color: ENTITY_COLORS.organization,
          val: 10,
          slug: 'central-intelligence-agency',
          entityName: 'Central Intelligence Agency'
        };
      }

      initializedRootIdRef.current = targetId;
      setExplorerData({ nodes: [root], links: [] });
      await expandNode(root);
    }

    initExplorer();
  }, [initialRootNode, expandNode]);

  // Handle node selection without resetting explorer
  const handleNodeClick = (node: GraphNode) => {
    onNodeClick(node);
    if (!expandedNodeIds.has(node.id)) {
      expandNode(node);
    }
  };

  return (
    <div className="h-full flex flex-col relative bg-muted/50 overflow-hidden">
      {/* Explorer Header */}
      <div className="p-3 bg-background border-b flex justify-between items-center z-10">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span>🔍</span> Progressive Neighborhood Explorer
          </h3>
          <p className="text-xs text-muted-foreground">
            Click any node to expand its connections ({explorerData.nodes.length} nodes, {expandedNodeIds.size} expanded)
          </p>
        </div>
        <div className="flex gap-2">
          {explorerData.nodes.length > 1 && (
            <button
              onClick={() => {
                if (explorerData.nodes.length > 0) {
                  const root = explorerData.nodes[0];
                  setExplorerData({ nodes: [root], links: [] });
                  setExpandedNodeIds(new Set());
                  expandNode(root);
                }
              }}
              className="px-3 py-1 bg-muted hover:bg-muted/80 text-foreground text-xs font-medium rounded transition-colors"
            >
              Reset Exploration
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <RelationshipGraph
          graphData={explorerData}
          onNodeClick={handleNodeClick}
        />

        {loadingNodeId && (
          <div className="absolute bottom-4 right-4 bg-card border rounded-lg p-3 flex items-center gap-2 text-xs text-foreground z-20">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Expanding connections...
          </div>
        )}
      </div>
    </div>
  );
}
