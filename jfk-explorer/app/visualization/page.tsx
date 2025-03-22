'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import RelationshipGraph from '@/app/components/graph/RelationshipGraph';
import { generateGraphData, generateDocumentCentricGraph, generateEntityCentricGraph } from '@/app/lib/utils/graph-transformer';
import { GraphData, GraphFilterOptions, GraphConfig } from '@/app/lib/models/graph';
import Spinner from '@/app/components/Spinner';

export default function VisualizationPage() {
  const searchParams = useSearchParams();
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [focusType, setFocusType] = useState<'document' | 'entity' | 'all'>('all');
  const [showControls, setShowControls] = useState<boolean>(true);
  const [maxNodes, setMaxNodes] = useState<number>(100);
  const [is3D, setIs3D] = useState<boolean>(false);
  const [is3DLoading, setIs3DLoading] = useState<boolean>(false);
  
  // Get parameters from URL
  const docId = searchParams.get('document');
  const entityName = searchParams.get('entity');
  
  // Graph configuration
  const graphConfig = useMemo<GraphConfig>(() => ({
    nodeSize: 6,
    linkWidth: 1.5,
    chargeStrength: -120,
    linkDistance: 100,
    showLabels: true,
    colorByGroup: true,
    is3D
  }), [is3D]);
  
  // Graph filter options
  const [filterOptions, setFilterOptions] = useState<GraphFilterOptions>({
    maxNodes,
    documentTypes: [],
    entityTypes: [],
    searchQuery: ''
  });
  
  // Load graph data based on URL params or default to full graph
  useEffect(() => {
    async function loadGraphData() {
      setLoading(true);
      setError(null);
      
      try {
        let data: GraphData;
        
        if (docId) {
          // Load document-centric graph
          data = await generateDocumentCentricGraph(docId);
          setFocusedId(docId);
          setFocusType('document');
        } else if (entityName) {
          // Load entity-centric graph
          data = await generateEntityCentricGraph(entityName);
          setFocusedId(entityName);
          setFocusType('entity');
        } else {
          // Load full graph with filters
          data = await generateGraphData({
            ...filterOptions,
            maxNodes
          });
          setFocusedId(null);
          setFocusType('all');
        }
        
        setGraphData(data);
      } catch (err) {
        console.error('Error loading graph data:', err);
        setError('Failed to load visualization data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    loadGraphData();
  }, [docId, entityName, maxNodes, filterOptions]);
  
  // Update max nodes and reload graph
  const handleMaxNodesChange = (value: number) => {
    setMaxNodes(value);
  };
  
  // Toggle 3D mode safely
  const toggleViewMode = () => {
    // If we're turning on 3D mode, show loading indicator
    if (!is3D) {
      setIs3DLoading(true);
      // Brief delay to allow UI to update before switching modes
      setTimeout(() => {
        setIs3D(true);
        setIs3DLoading(false);
      }, 100);
    } else {
      // Switching back to 2D is immediate
      setIs3D(false);
    }
  };
  
  // Determine if we're showing the simplified 2D version for performance
  const shouldUseSimpleView = useMemo(() => {
    return graphData.nodes.length > 200;
  }, [graphData.nodes.length]);
  
  return (
    <div className="flex flex-col w-full h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm p-4">
        <h1 className="text-2xl font-bold text-gray-900">JFK Files Relationship Network</h1>
        <p className="text-gray-600">
          {focusType === 'document' && focusedId ? (
            `Viewing relationships for document: ${focusedId}`
          ) : focusType === 'entity' && focusedId ? (
            `Viewing relationships for entity: ${focusedId}`
          ) : (
            `Visualizing connections between documents and entities (${graphData.nodes.length} nodes, ${graphData.links.length} connections)`
          )}
        </p>
      </div>
      
      <div className="flex flex-grow overflow-hidden">
        {/* Controls panel */}
        {showControls && (
          <div className="w-72 bg-white border-r p-4 flex flex-col overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Visualization Controls</h2>
            
            <div className="mb-6">
              <label className="block mb-2 font-medium text-gray-700">Max Nodes</label>
              <div className="flex items-center">
                <input 
                  type="range" 
                  min="10" 
                  max="500" 
                  value={maxNodes} 
                  onChange={(e) => handleMaxNodesChange(parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="ml-2 text-sm text-gray-600">{maxNodes}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block mb-2 font-medium text-gray-700">Visualization Mode</label>
              <button 
                onClick={toggleViewMode}
                disabled={is3DLoading || shouldUseSimpleView}
                className={`w-full py-2 px-4 ${
                  is3DLoading 
                    ? 'bg-gray-100 text-gray-400 cursor-wait' 
                    : shouldUseSimpleView
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                } rounded`}
              >
                {is3DLoading 
                  ? "Loading 3D Mode..." 
                  : is3D 
                  ? "Switch to 2D View" 
                  : "Switch to 3D View"}
              </button>
              
              {shouldUseSimpleView && !is3D && (
                <p className="mt-2 text-xs text-gray-500">
                  3D view is disabled for datasets with more than 200 nodes to maintain performance.
                  Reduce the number of nodes to enable 3D view.
                </p>
              )}
              
              {is3D && (
                <p className="mt-2 text-xs text-gray-500">
                  3D mode uses more system resources. Switch back to 2D for better performance.
                </p>
              )}
            </div>
            
            <div className="mb-6">
              <label className="block mb-2 font-medium text-gray-700">Network Statistics</label>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Documents: {graphData.nodes.filter(n => n.type === 'document').length}</p>
                <p>Entities: {graphData.nodes.filter(n => n.type === 'entity').length}</p>
                <p>Connections: {graphData.links.length}</p>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t">
              <p className="text-xs text-gray-500 mb-2">
                Click on nodes to explore document or entity details.
                Use mouse wheel to zoom and drag to pan the visualization.
                {is3D && " In 3D mode, drag with right mouse button to rotate view."}
              </p>
              <a 
                href="/visualization" 
                className="text-blue-600 hover:text-blue-800 text-sm block"
              >
                Reset Visualization
              </a>
            </div>
          </div>
        )}
        
        {/* Graph visualization */}
        <div className="flex-1 relative flex overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <Spinner size="large" />
              <span className="ml-3 text-gray-600">Loading visualization...</span>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center p-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <RelationshipGraph 
              graphData={graphData}
              config={{
                ...graphConfig,
                // Override 3D setting if we have too many nodes
                is3D: is3D && !shouldUseSimpleView
              }}
              height={window.innerHeight - 120} // Adjust for header
              width={window.innerWidth - (showControls ? 288 : 0)} // Adjust for sidebar
            />
          )}
          
          {/* Toggle controls button */}
          <button
            onClick={() => setShowControls(!showControls)}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow hover:shadow-md z-10"
            aria-label={showControls ? "Hide controls" : "Show controls"}
          >
            {showControls ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 