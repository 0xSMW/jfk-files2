'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import RelationshipGraph from '@/app/components/graph/RelationshipGraph';
import RelationshipDetailPanel from '@/app/components/graph/RelationshipDetailPanel';
import FilterControls from '@/app/components/graph/FilterControls';
import GraphLegend from '@/app/components/graph/GraphLegend';
import { generateGraphData, generateDocumentCentricGraph, generateEntityCentricGraph } from '@/app/lib/utils/graph-transformer';
import { getDataStatistics } from '@/app/lib/utils/data-loader';
import { GraphData, GraphFilterOptions, GraphConfig, GraphNode } from '@/app/lib/models/graph';
import Spinner from '@/app/components/Spinner';

// Main visualization content component that uses search params
function VisualizationContent() {
  const searchParams = useSearchParams();
  
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [originalGraphData, setOriginalGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [focusType, setFocusType] = useState<'document' | 'entity' | 'all'>('all');
  const [showControls, setShowControls] = useState<boolean>(true);
  const [maxNodes, setMaxNodes] = useState<number>(100);
  const [is3D, setIs3D] = useState<boolean>(false);
  const [is3DLoading, setIs3DLoading] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [statistics, setStatistics] = useState<{
    totalDocuments: number;
    documentsWithTags: number;
    uniqueTags: number;
    totalEntities: number;
    matchingTags: number;
  } | null>(null);
  
  // Detail panel state
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState<boolean>(false);
  
  // Get docId and entityName from URL parameters
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
  
  // Graph statistics for the legend
  const graphStats = useMemo(() => ({
    documentCount: graphData.nodes.filter(n => n.type === 'document').length,
    entityCount: graphData.nodes.filter(n => n.type === 'entity').length,
    linkCount: graphData.links.length
  }), [graphData]);
  
  // Load statistics for debugging
  useEffect(() => {
    async function loadStatistics() {
      try {
        const stats = await getDataStatistics();
        setStatistics(stats);
      } catch (err) {
        console.error('Error loading statistics:', err);
      }
    }
    loadStatistics();
  }, []);
  
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
        setOriginalGraphData(data);
        setIsFocusMode(false);
      } catch (err) {
        console.error('Error loading graph data:', err);
        setError('Failed to load visualization data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    loadGraphData();
  }, [docId, entityName, maxNodes, filterOptions]);
  
  // Handle node click to show detail panel
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    setShowDetailPanel(true);
  };
  
  // Close detail panel
  const handleCloseDetailPanel = () => {
    setShowDetailPanel(false);
    setSelectedNode(null);
  };
  
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
  
  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<GraphFilterOptions>) => {
    // Use a more controlled approach to update filters
    setFilterOptions(prev => {
      // Only update if the values are actually different
      const updatedFilters = { ...prev };
      let hasChanges = false;
      
      if (newFilters.documentTypes && 
          JSON.stringify(newFilters.documentTypes) !== JSON.stringify(prev.documentTypes)) {
        updatedFilters.documentTypes = newFilters.documentTypes;
        hasChanges = true;
      }
      
      if (newFilters.entityTypes && 
          JSON.stringify(newFilters.entityTypes) !== JSON.stringify(prev.entityTypes)) {
        updatedFilters.entityTypes = newFilters.entityTypes;
        hasChanges = true;
      }
      
      if (newFilters.searchQuery !== undefined && 
          newFilters.searchQuery !== prev.searchQuery) {
        updatedFilters.searchQuery = newFilters.searchQuery;
        hasChanges = true;
      }
      
      return hasChanges ? updatedFilters : prev;
    });
  };
  
  // Focus on a specific node and its connections
  const handleFocusMode = (node: GraphNode) => {
    if (!originalGraphData) return;
    
    // If already in focus mode and clicking the same node, reset
    if (isFocusMode && selectedNode?.id === node.id) {
      setGraphData(originalGraphData);
      setIsFocusMode(false);
      return;
    }
    
    // Get all node IDs directly connected to the selected node
    const connectedNodeIds = new Set<string>([
      node.id,
      ...originalGraphData.links
        .filter(link => 
          (typeof link.source === 'string' ? link.source : (link.source as any).id) === node.id || 
          (typeof link.target === 'string' ? link.target : (link.target as any).id) === node.id
        )
        .flatMap(link => [
          typeof link.source === 'string' ? link.source : (link.source as any).id,
          typeof link.target === 'string' ? link.target : (link.target as any).id
        ])
    ]);
    
    // Filter nodes to only include the selected node and its connections
    const focusedNodes = originalGraphData.nodes.filter(n => connectedNodeIds.has(n.id));
    
    // Filter links to only include connections between these nodes
    const focusedLinks = originalGraphData.links.filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      return connectedNodeIds.has(sourceId) && connectedNodeIds.has(targetId);
    });
    
    // Update graph data with focused subset
    setGraphData({ nodes: focusedNodes, links: focusedLinks });
    setIsFocusMode(true);
  };
  
  // Exit focus mode
  const handleExitFocusMode = () => {
    if (originalGraphData) {
      setGraphData(originalGraphData);
      setIsFocusMode(false);
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
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            {focusType === 'document' && focusedId ? (
              `Viewing relationships for document: ${focusedId}`
            ) : focusType === 'entity' && focusedId ? (
              `Viewing relationships for entity: ${focusedId}`
            ) : (
              `Visualizing connections between documents and entities (${graphData.nodes.length} nodes, ${graphData.links.length} connections)`
            )}
          </p>
          
          {isFocusMode && (
            <button 
              onClick={handleExitFocusMode}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Exit Focus Mode
            </button>
          )}
        </div>
      </div>
      
      <div className="flex flex-grow overflow-hidden">
        {/* Controls panel */}
        {showControls && (
          <div className="w-72 bg-white border-r p-4 flex flex-col overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Visualization Controls</h2>
            
            <div className="mb-6">
              <label className="block mb-2 font-medium text-gray-700 text-sm">Max Nodes</label>
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
              <label className="block mb-2 font-medium text-gray-700 text-sm">Visualization Mode</label>
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
            
            {/* Filter options */}
            <div className="mb-6 border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Filters</h3>
              <FilterControls 
                filterOptions={filterOptions}
                onChange={handleFilterChange}
                statistics={statistics}
              />
            </div>
            
            {/* Graph legend */}
            <div className="mb-6 border-t pt-4">
              <GraphLegend 
                graphStats={graphStats}
              />
            </div>
            
            <div className="mt-auto pt-4 border-t">
              <a 
                href="/visualization" 
                className="text-blue-600 hover:text-blue-800 text-sm block"
              >
                Reset Visualization
              </a>
            </div>
          </div>
        )}
        
        {/* Graph visualization and detail panel container */}
        <div className={`flex-1 flex ${showDetailPanel ? 'overflow-hidden' : 'overflow-auto'}`}>
          {/* Graph area */}
          <div className={`relative ${showDetailPanel ? 'w-2/3' : 'w-full'} h-full`}>
            {loading ? (
              <div className="flex-1 flex items-center justify-center bg-gray-50 h-full">
                <Spinner size="large" />
                <span className="ml-3 text-gray-600">Loading visualization...</span>
              </div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center bg-gray-50 h-full">
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
            ) : graphData.nodes.length <= 1 ? (
              <div className="flex-1 flex items-center justify-center bg-gray-50 h-full">
                <div className="text-center p-8">
                  <p className="text-red-600 mb-4">No data found. Please try again.</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <RelationshipGraph 
                  graphData={graphData}
                  config={{
                    ...graphConfig,
                    // Override 3D setting if we have too many nodes
                    is3D: is3D && !shouldUseSimpleView
                  }}
                  onNodeClick={handleNodeClick}
                  height={window.innerHeight - 120} // Adjust for header
                  width={window.innerWidth - (showControls ? 288 : 0) - (showDetailPanel ? window.innerWidth / 3 : 0)} // Adjust for sidebar and detail panel
                />
                
                {graphData.nodes.length > 0 && graphData.links.length === 0 && (
                  <div className="absolute top-4 left-4 bg-yellow-50 p-4 rounded-lg shadow-md max-w-sm">
                    <h3 className="text-yellow-800 font-medium mb-2">No connections found</h3>
                    <p className="text-yellow-700 text-sm mb-2">
                      This could be because:
                    </p>
                    <ul className="list-disc pl-8 text-yellow-700 text-sm mb-2">
                      <li>Documents do not have tags</li>
                      <li>Tags do not match any entity names</li>
                      <li>No entity files were found</li>
                    </ul>
                    <p className="text-yellow-700 text-sm">
                      Please check the Data Statistics in the controls panel for more information.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Toggle controls button */}
            <button
              onClick={() => setShowControls(!showControls)}
              className="absolute top-4 left-4 p-2 bg-white rounded-full shadow hover:shadow-md z-10"
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
          
          {/* Detail panel */}
          {showDetailPanel && (
            <div className="w-1/3 border-l border-gray-200 h-full bg-white">
              <RelationshipDetailPanel 
                selectedNode={selectedNode}
                graphData={graphData}
                onClose={handleCloseDetailPanel}
                onNodeSelect={handleNodeClick}
                onFocus={handleFocusMode}
                inFocusMode={isFocusMode}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main page component with suspense boundary for useSearchParams
export default function VisualizationPage() {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
        <Spinner size="large" />
      </div>
    }>
      <VisualizationContent />
    </Suspense>
  );
} 