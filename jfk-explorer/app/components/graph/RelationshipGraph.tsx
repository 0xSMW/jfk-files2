'use client';

import '@/app/lib/utils/three-polyfill';
import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { GraphData, GraphNode, GraphLink, GraphConfig } from '@/app/lib/models/graph';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

export interface RelationshipGraphHandle {
  centerOnNode: (nodeId: string, zoomLevel?: number) => void;
  zoomToFit: (duration?: number) => void;
}

interface RelationshipGraphProps {
  graphData: GraphData;
  config?: Partial<GraphConfig>;
  height?: number;
  width?: number;
  onNodeClick?: (node: GraphNode) => void;
  selectedNode?: GraphNode | null;
  pathNodeIds?: Set<string>;
  annotatedNodeIds?: Set<string>;
  hideUnconnectedNodes?: boolean;
}

const defaultConfig: GraphConfig = {
  nodeSize: 5,
  linkWidth: 1,
  chargeStrength: -120,
  linkDistance: 100,
  showLabels: true,
  colorByGroup: true,
  is3D: false
};

interface ThemeColors {
  bg: string;
  fg: string;
  doc: string;
  entity: string;
  highlight: string;
  border: string;
}

const RelationshipGraph = forwardRef<RelationshipGraphHandle, RelationshipGraphProps>(({
  graphData,
  config = {},
  height = 600,
  width = 800,
  onNodeClick,
  selectedNode,
  pathNodeIds,
  annotatedNodeIds,
  hideUnconnectedNodes = true
}, ref) => {
  const mergedConfig = { ...defaultConfig, ...config };
  const router = useRouter();
  const graphRef = useRef<any>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [show3DOverlay, setShow3DOverlay] = useState<boolean>(true);
  const [themeColors, setThemeColors] = useState<ThemeColors>({
    bg: '#ffffff',
    fg: '#0f172a',
    doc: '#64748b',
    entity: '#2563eb',
    highlight: '#ef4444',
    border: '#cbd5e1'
  });

  // Resolve CSS variables dynamically on mount & theme change
  useEffect(() => {
    const updateColors = () => {
      if (typeof window === 'undefined') return;
      const cs = getComputedStyle(document.documentElement);
      const getHsl = (varName: string, fallback: string) => {
        const val = cs.getPropertyValue(varName).trim();
        return val ? `hsl(${val})` : fallback;
      };

      setThemeColors({
        bg: getHsl('--background', '#ffffff'),
        fg: getHsl('--foreground', '#0f172a'),
        doc: getHsl('--muted-foreground', '#64748b'),
        entity: getHsl('--primary', '#2563eb'),
        highlight: getHsl('--destructive', '#ef4444'),
        border: getHsl('--border', '#cbd5e1')
      });
    };

    updateColors();

    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });
    return () => observer.disconnect();
  }, []);

  // Adjacency Map for degree calculations & spotlighting
  const adjacencyMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    graphData.nodes.forEach(n => map.set(n.id, new Set()));
    graphData.links.forEach(link => {
      const s = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const t = typeof link.target === 'string' ? link.target : (link.target as any).id;
      if (!map.has(s)) map.set(s, new Set());
      if (!map.has(t)) map.set(t, new Set());
      map.get(s)!.add(t);
      map.get(t)!.add(s);
    });
    return map;
  }, [graphData]);

  // Filter out isolated (unconnected) nodes if option is on
  const filteredData = useMemo(() => {
    if (!hideUnconnectedNodes) return graphData;

    const connectedNodes = graphData.nodes.filter(n => (adjacencyMap.get(n.id)?.size || 0) > 0);
    const connectedNodeIds = new Set(connectedNodes.map(n => n.id));

    const connectedLinks = graphData.links.filter(link => {
      const s = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const t = typeof link.target === 'string' ? link.target : (link.target as any).id;
      return connectedNodeIds.has(s) && connectedNodeIds.has(t);
    });

    return { nodes: connectedNodes, links: connectedLinks };
  }, [graphData, adjacencyMap, hideUnconnectedNodes]);

  // Expose imperative methods
  useImperativeHandle(ref, () => ({
    centerOnNode: (nodeId: string, zoomLevel = 2) => {
      const node = filteredData.nodes.find(n => n.id === nodeId);
      if (node && graphRef.current) {
        if (mergedConfig.is3D) {
          const distance = 200;
          const distRatio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0);
          graphRef.current.cameraPosition(
            { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
            { x: node.x || 0, y: node.y || 0, z: node.z || 0 },
            1000
          );
        } else {
          graphRef.current.centerAt(node.x, node.y, 500);
          graphRef.current.zoom(zoomLevel, 500);
        }
      }
    },
    zoomToFit: (duration = 400) => {
      graphRef.current?.zoomToFit(duration, 30);
    }
  }));

  useEffect(() => {
    if (mergedConfig.is3D) {
      setShow3DOverlay(true);
      const timer = setTimeout(() => setShow3DOverlay(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [mergedConfig.is3D]);

  const handleNodeClick = useCallback((node: any) => {
    const typedNode = node as GraphNode & { slug?: string };
    if (onNodeClick) {
      onNodeClick(typedNode);
    } else {
      if (typedNode.type === 'document') {
        const docId = typedNode.id.replace(/^doc-/, '');
        router.push(`/documents/${docId}`);
      } else if (typedNode.type === 'entity') {
        const entitySlug = typedNode.slug || (typedNode.metadata as any)?.slug;
        if (entitySlug) {
          router.push(`/entities/${entitySlug}`);
        }
      }
    }
  }, [onNodeClick, router]);

  const handleNodeHover = useCallback((node: any) => {
    const typedNode = node ? (node as GraphNode) : null;
    setHoveredNode(typedNode);
    document.body.style.cursor = node ? 'pointer' : 'default';
  }, []);

  const connectedToHovered = useCallback((nodeId: string) => {
    if (!hoveredNode) return true;
    if (hoveredNode.id === nodeId) return true;
    return adjacencyMap.get(hoveredNode.id)?.has(nodeId) ?? false;
  }, [hoveredNode, adjacencyMap]);

  // Graph props configuration
  const graphProps = {
    graphData: filteredData,
    height,
    width,
    backgroundColor: themeColors.bg,
    nodeVal: (node: any) => {
      const degree = adjacencyMap.get(node.id)?.size || 0;
      return Math.min(14, 4 + Math.sqrt(degree) * 2);
    },
    nodeLabel: (node: any) => `${(node as GraphNode).label} (${(node as GraphNode).type})`,
    nodeColor: (node: any) => {
      const typedNode = node as GraphNode;
      if (pathNodeIds?.has(typedNode.id)) return themeColors.highlight;
      return typedNode.type === 'document' ? themeColors.doc : themeColors.entity;
    },
    linkWidth: (link: any) => {
      if (pathNodeIds) {
        const s = typeof link.source === 'string' ? link.source : (link.source as any).id;
        const t = typeof link.target === 'string' ? link.target : (link.target as any).id;
        if (pathNodeIds.has(s) && pathNodeIds.has(t)) return 3;
      }
      return 1.2;
    },
    linkLabel: (link: any) => (link as GraphLink).label || (link as GraphLink).type || '',
    linkColor: () => `${themeColors.border}`,
    linkDirectionalParticles: 0,
    onNodeClick: handleNodeClick,
    onNodeHover: handleNodeHover,

    // Custom 2D Canvas Renderer
    nodeCanvasObject: !mergedConfig.is3D ? (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const typedNode = node as GraphNode & { x: number; y: number };
      const isSelected = selectedNode?.id === typedNode.id;
      const isHovered = hoveredNode?.id === typedNode.id;
      const isConnected = connectedToHovered(typedNode.id);
      const isPathNode = pathNodeIds?.has(typedNode.id);

      const degree = adjacencyMap.get(typedNode.id)?.size || 0;
      const r = Math.min(14, 4 + Math.sqrt(degree) * 2);
      const x = typedNode.x;
      const y = typedNode.y;

      ctx.globalAlpha = (hoveredNode && !isConnected && !isSelected) ? 0.15 : 1.0;

      // Node Fill Color derived from Theme Tokens
      ctx.fillStyle = isPathNode
        ? themeColors.highlight
        : (typedNode.type === 'document' ? themeColors.doc : themeColors.entity);

      // Draw Node shape
      if (typedNode.type === 'document') {
        const w = r * 2.2;
        const h = r * 2.6;
        ctx.beginPath();
        ctx.rect(x - w / 2, y - h / 2, w, h);
        ctx.fill();

        if (isSelected || isHovered) {
          ctx.strokeStyle = themeColors.highlight;
          ctx.lineWidth = 2 / globalScale;
          ctx.stroke();
        }
      } else {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();

        if (isSelected || isHovered) {
          ctx.strokeStyle = themeColors.highlight;
          ctx.lineWidth = 2 / globalScale;
          ctx.stroke();
        }
      }

      // Draw Labels only when globalScale > 1.4 or when hovered/selected
      const shouldDrawLabel = globalScale > 1.4 || isHovered || isSelected || isPathNode;

      if (shouldDrawLabel && mergedConfig.showLabels) {
        const fontSize = 12 / globalScale;
        ctx.font = `${fontSize}px Inter, sans-serif`;

        const displayLabel = typedNode.label.length > 24 ? typedNode.label.slice(0, 22) + '…' : typedNode.label;
        const textWidth = ctx.measureText(displayLabel).width;
        const padX = 4 / globalScale;
        const padY = 2 / globalScale;

        const labelX = x;
        const labelY = y + r + fontSize / 2 + 3 / globalScale;

        // Draw background halo rect using theme background color
        ctx.fillStyle = themeColors.bg;
        ctx.fillRect(
          labelX - textWidth / 2 - padX,
          labelY - fontSize / 2 - padY,
          textWidth + padX * 2,
          fontSize + padY * 2
        );

        // Draw text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = themeColors.fg;
        ctx.fillText(displayLabel, labelX, labelY);
      }

      ctx.globalAlpha = 1.0;
    } : undefined,

    cooldownTicks: 100,
    cooldownTime: 15000,
    d3AlphaDecay: 0.02,
    d3VelocityDecay: 0.3,
    ref: graphRef
  };

  if (!filteredData.nodes.length) {
    return (
      <div className="flex items-center justify-center border rounded-xl h-full w-full bg-background p-8">
        <p className="text-muted-foreground text-sm">No network data available for current selection</p>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-xl bg-background overflow-hidden w-full h-full border"
      tabIndex={0}
      aria-label="Interactive relationship network graph"
    >
      {mergedConfig.is3D ? (
        <ForceGraph3D {...graphProps} />
      ) : (
        <ForceGraph2D {...graphProps} />
      )}

      {/* 3D Mode Camera Controls Overlay Prompt */}
      {mergedConfig.is3D && show3DOverlay && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border px-4 py-2 rounded-full text-xs shadow-sm backdrop-blur-sm flex items-center gap-3 z-30">
          <span>🎮 <strong>Camera Controls:</strong> Left-drag: rotate · Right-drag: pan · Scroll: zoom</span>
          <button onClick={() => setShow3DOverlay(false)} className="text-muted-foreground hover:text-foreground font-bold ml-1">✕</button>
        </div>
      )}

      {/* Node Hover Information Card */}
      {hoveredNode && (
        <div className="absolute bottom-4 left-4 bg-popover/95 text-popover-foreground backdrop-blur-sm shadow-sm border rounded-lg p-3 max-w-xs z-20 pointer-events-none">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{
                backgroundColor: hoveredNode.type === 'document' ? themeColors.doc : themeColors.entity
              }}
            />
            <h3 className="font-semibold text-xs truncate">{hoveredNode.label}</h3>
          </div>
          <p className="text-[11px] text-muted-foreground capitalize">Type: {hoveredNode.group || hoveredNode.type}</p>
        </div>
      )}

      {/* Graph Control Quick Buttons */}
      <div className="absolute top-3 right-3 flex gap-2 z-20">
        <button
          onClick={() => graphRef.current?.zoomToFit(400, 30)}
          className="bg-background/90 hover:bg-background text-foreground border px-2.5 py-1 rounded-md text-xs font-medium backdrop-blur-sm transition-all"
        >
          🔍 Fit View
        </button>
      </div>
    </div>
  );
});

RelationshipGraph.displayName = 'RelationshipGraph';

export default RelationshipGraph;
