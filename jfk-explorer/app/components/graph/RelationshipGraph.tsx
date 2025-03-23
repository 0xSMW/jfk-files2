'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { GraphData, GraphNode, GraphLink, GraphConfig } from '@/app/lib/models/graph';

// Load both components, assuming A-Frame is available from the root layout
const ForceGraph2D = dynamic(() => import('react-force-graph').then(mod => mod.ForceGraph2D), { ssr: false });
const ForceGraph3D = dynamic(() => import('react-force-graph').then(mod => mod.ForceGraph3D), { ssr: false });

interface RelationshipGraphProps {
  graphData: GraphData;
  config?: Partial<GraphConfig>;
  height?: number;
  width?: number;
  onNodeClick?: (node: GraphNode) => void;
  onNodeHover?: (node: GraphNode | null) => void;
  onLinkClick?: (link: GraphLink) => void;
}

// Default configuration
const defaultConfig: GraphConfig = {
  nodeSize: 5,
  linkWidth: 1,
  chargeStrength: -120,
  linkDistance: 100,
  showLabels: true,
  colorByGroup: true,
  is3D: false
};

export default function RelationshipGraph({
  graphData,
  config = {},
  height = 600,
  width = 800,
  onNodeClick,
  onNodeHover,
  onLinkClick
}: RelationshipGraphProps) {
  const mergedConfig = { ...defaultConfig, ...config };
  const router = useRouter();
  const graphRef = useRef<any>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  
  // Handle window resizing
  const [dimensions, setDimensions] = useState({ width, height });
  
  useEffect(() => {
    function handleResize() {
      if (graphRef.current?.containerEl) {
        const container = graphRef.current.containerEl.parentElement;
        if (container) {
          setDimensions({
            width: container.clientWidth,
            height: container.clientHeight || height
          });
        }
      }
    }
    
    window.addEventListener('resize', handleResize);
    // Initial size setting
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, [height]);
  
  // Handle node click
  const handleNodeClick = useCallback((node: any) => {
    const typedNode = node as GraphNode;
    if (onNodeClick) {
      onNodeClick(typedNode);
    } else {
      // Default behavior - navigate to document or entity page
      if (typedNode.type === 'document') {
        const docId = typedNode.id.replace('doc-', '');
        router.push(`/documents/${docId}`);
      } else if (typedNode.type === 'entity') {
        const entityName = typedNode.id.replace('entity-', '');
        router.push(`/entities/${encodeURIComponent(entityName)}`);
      }
    }
  }, [onNodeClick, router]);
  
  // Handle node hover
  const handleNodeHover = useCallback((node: any) => {
    const typedNode = node ? (node as GraphNode) : null;
    setHoveredNode(typedNode);
    if (onNodeHover) {
      onNodeHover(typedNode);
    }
    
    // Change cursor style
    document.body.style.cursor = node ? 'pointer' : 'default';
  }, [onNodeHover]);
  
  // Handle link click
  const handleLinkClick = useCallback((link: any) => {
    if (onLinkClick) {
      onLinkClick(link as GraphLink);
    }
  }, [onLinkClick]);
  
  // Common graph props
  const graphProps = {
    graphData,
    height: dimensions.height,
    width: dimensions.width,
    nodeVal: (node: any) => (node as GraphNode).val || mergedConfig.nodeSize,
    nodeLabel: (node: any) => `${(node as GraphNode).label} (${(node as GraphNode).group})`,
    nodeColor: (node: any) => mergedConfig.colorByGroup ? ((node as GraphNode).color || '#718096') : '#718096',
    linkWidth: (link: any) => (link as GraphLink).strength || mergedConfig.linkWidth,
    linkLabel: (link: any) => (link as GraphLink).label || '',
    linkColor: (link: any) => (link as GraphLink).color || '#CBD5E0',
    onNodeClick: handleNodeClick,
    onNodeHover: handleNodeHover,
    onLinkClick: handleLinkClick,
    nodeCanvasObject: mergedConfig.showLabels && !mergedConfig.is3D ? 
      (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const typedNode = node as GraphNode & {x: number, y: number};
        const label = typedNode.label;
        const fontSize = 12/globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        
        // Node circle
        ctx.beginPath();
        ctx.arc(typedNode.x, typedNode.y, typedNode.val || mergedConfig.nodeSize, 0, 2 * Math.PI);
        ctx.fillStyle = typedNode.color || '#718096';
        ctx.fill();
        
        // Only show labels when zoomed in or when the node is hovered
        if (globalScale >= 0.8 || typedNode === hoveredNode) {
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);
          
          // Draw text background
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(
            typedNode.x - bckgDimensions[0] / 2,
            typedNode.y - bckgDimensions[1] / 2 - fontSize,
            bckgDimensions[0],
            bckgDimensions[1]
          );
          
          // Draw text
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = typedNode.type === 'document' ? '#1A202C' : '#2D3748';
          ctx.fillText(label, typedNode.x, typedNode.y - fontSize / 2);
        }
      } : undefined,
    cooldownTicks: 100,
    cooldownTime: 15000,
    d3AlphaDecay: 0.02,
    d3VelocityDecay: 0.3,
    d3Force: mergedConfig.is3D ? 
      undefined : 
      (key: string, value: any) => {
        if (key === 'charge') {
          // Increased repulsion for better node separation
          return value.strength(mergedConfig.chargeStrength * 1.25);
        }
        if (key === 'link') {
          // Slightly longer links for better visibility
          return value.distance(mergedConfig.linkDistance * 1.2);
        }
        return value;
      },
    ref: graphRef
  };
  
  if (!graphData.nodes.length) {
    return (
      <div className="flex items-center justify-center border rounded-lg h-full w-full bg-gray-50 p-8">
        <p className="text-gray-500">No data available for visualization</p>
      </div>
    );
  }
  
  return (
    <div className="relative border rounded-lg bg-white overflow-hidden" style={{ height: `${height}px`, width: '100%' }}>
      {/* Render the graph with a try-catch fallback */}
      {(() => {
        try {
          return mergedConfig.is3D ? (
            <ForceGraph3D {...graphProps} />
          ) : (
            <ForceGraph2D {...graphProps} />
          );
        } catch (error) {
          console.error('Graph rendering failed:', error);
          return <div className="text-red-600">Failed to render graph. Please try again.</div>;
        }
      })()}
      
      {hoveredNode && (
        <div className="absolute bottom-4 left-4 bg-white shadow-md rounded-md p-3 max-w-xs">
          <h3 className="font-semibold text-gray-900">{hoveredNode.label}</h3>
          <p className="text-sm text-gray-600">Type: {hoveredNode.group || hoveredNode.type}</p>
          {hoveredNode.type === 'document' && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              {(hoveredNode.metadata as any).summary_one_paragraph || 'No summary available'}
            </p>
          )}
        </div>
      )}
      
      <div className="absolute top-2 right-2 flex space-x-2">
        <button 
          onClick={() => graphRef.current?.zoomToFit(400, 30)}
          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm hover:bg-blue-200"
        >
          Fit View
        </button>
        {graphData.nodes.length > 10 && !mergedConfig.is3D && (
          <button 
            onClick={() => graphRef.current?.d3Force('charge').strength(mergedConfig.chargeStrength * 1.5)}
            className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm hover:bg-blue-200"
          >
            Spread
          </button>
        )}
      </div>
    </div>
  );
} 