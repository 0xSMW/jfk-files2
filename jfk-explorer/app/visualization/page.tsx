'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import RelationshipGraph from '@/app/components/graph/RelationshipGraph';
import RelationshipDetailPanel from '@/app/components/graph/RelationshipDetailPanel';
import FilterControls from '@/app/components/graph/FilterControls';
import GraphLegend from '@/app/components/graph/GraphLegend';
import TimelineView from '@/app/components/graph/TimelineView';
import { GraphData, GraphFilterOptions, GraphConfig, GraphNode } from '@/app/lib/models/graph';
import Spinner from '@/app/components/Spinner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type ViewMode = '2d' | '3d' | 'timeline';

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
  const [sliderValue, setSliderValue] = useState<number>(100);
  const [viewMode, setViewMode] = useState<ViewMode>('2d');
  const [is3D, setIs3D] = useState<boolean>(false);
  const [is3DLoading, setIs3DLoading] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [hideUnconnected, setHideUnconnected] = useState<boolean>(true);
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

  // Load statistics via API route
  useEffect(() => {
    async function loadStatistics() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const stats = await res.json();
          setStatistics(stats);
        }
      } catch (err) {
        console.error('Error loading statistics:', err);
      }
    }
    loadStatistics();
  }, []);

  // Load graph data based on URL params via API routes
  useEffect(() => {
    async function loadGraphData() {
      setLoading(true);
      setError(null);

      try {
        let url = '/api/graph';
        if (docId) {
          url = `/api/graph/document/${encodeURIComponent(docId)}`;
          setFocusedId(docId);
          setFocusType('document');
        } else if (entityName) {
          url = `/api/graph/entity/${encodeURIComponent(entityName)}`;
          setFocusedId(entityName);
          setFocusType('entity');
        } else {
          const params = new URLSearchParams();
          if (maxNodes) params.set('maxNodes', maxNodes.toString());
          if (filterOptions.searchQuery) params.set('searchQuery', filterOptions.searchQuery);
          if (filterOptions.documentTypes?.length) params.set('documentTypes', filterOptions.documentTypes.join(','));
          if (filterOptions.entityTypes?.length) params.set('entityTypes', filterOptions.entityTypes.join(','));
          url += `?${params.toString()}`;
          setFocusedId(null);
          setFocusType('all');
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('API request failed');
        const data: GraphData = await res.json();

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

  // Switch view mode safely (3D gets a brief loading window)
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === '3d') {
      if (!is3D) {
        setIs3DLoading(true);
        // Brief delay to allow UI to update before switching modes
        setTimeout(() => {
          setIs3D(true);
          setIs3DLoading(false);
        }, 100);
      }
    } else {
      // Switching back to 2D/timeline is immediate
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
    <TooltipProvider>
      <div className="flex flex-col w-full h-screen bg-background">
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-3xl font-semibold tracking-tight">JFK Files Relationship Network</h1>
          <div className="flex justify-between items-center mt-1">
            <p className="text-muted-foreground">
              {focusType === 'document' && focusedId ? (
                `Viewing relationships for document: ${focusedId}`
              ) : focusType === 'entity' && focusedId ? (
                `Viewing relationships for entity: ${focusedId}`
              ) : (
                `Visualizing connections between documents and entities (${graphData.nodes.length} nodes, ${graphData.links.length} connections)`
              )}
            </p>

            {isFocusMode && (
              <Button variant="outline" size="sm" onClick={handleExitFocusMode}>
                Exit Focus Mode
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-grow overflow-hidden">
          {/* Controls panel */}
          {showControls && (
            <div className="w-72 shrink-0 border-r bg-background p-4 pr-4 flex flex-col overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">Visualization Controls</h2>

              <div className="mb-6 space-y-3">
                <label className="block text-sm font-medium">
                  Max nodes &middot; <span className="text-muted-foreground">{sliderValue}</span>
                </label>
                <Slider
                  min={50}
                  max={500}
                  step={50}
                  value={[sliderValue]}
                  onValueChange={(v) => setSliderValue(v[0])}
                  onValueCommit={(v) => handleMaxNodesChange(v[0])}
                />
              </div>

              <div className="mb-6 space-y-2">
                <label className="block text-sm font-medium">View mode</label>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  value={viewMode}
                  onValueChange={(value) => {
                    if (value) handleViewModeChange(value as ViewMode);
                  }}
                >
                  <ToggleGroupItem value="2d" className="px-3">2D</ToggleGroupItem>
                  <ToggleGroupItem
                    value="3d"
                    className="px-3"
                    disabled={is3DLoading || shouldUseSimpleView}
                  >
                    3D
                  </ToggleGroupItem>
                  <ToggleGroupItem value="timeline" className="px-3">Timeline</ToggleGroupItem>
                </ToggleGroup>

                {is3DLoading && (
                  <p className="text-xs text-muted-foreground">Loading 3D mode...</p>
                )}

                {shouldUseSimpleView && !is3D && (
                  <p className="text-xs text-muted-foreground">
                    3D view is disabled for datasets with more than 200 nodes to maintain performance.
                    Reduce the number of nodes to enable 3D view.
                  </p>
                )}

                {is3D && (
                  <p className="text-xs text-muted-foreground">
                    3D mode uses more system resources. Switch back to 2D for better performance.
                  </p>
                )}
              </div>

              <div className="mb-6 flex items-center gap-2">
                <Checkbox
                  id="hide-unconnected"
                  checked={hideUnconnected}
                  onCheckedChange={(checked) => setHideUnconnected(checked === true)}
                />
                <label htmlFor="hide-unconnected" className="text-sm cursor-pointer">
                  Hide unconnected nodes
                </label>
              </div>

              {/* Filter options */}
              <div className="mb-6 border-t pt-4">
                <h3 className="text-sm font-medium mb-3">Filters</h3>
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
                  className="text-primary hover:underline text-sm block"
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
                <div className="flex-1 flex items-center justify-center bg-background h-full">
                  <Spinner size="large" />
                  <span className="ml-3 text-muted-foreground">Loading visualization...</span>
                </div>
              ) : error ? (
                <div className="flex-1 flex items-center justify-center bg-background h-full">
                  <div className="text-center p-8">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : graphData.nodes.length <= 1 ? (
                <div className="flex-1 flex items-center justify-center bg-background h-full">
                  <div className="text-center p-8">
                    <p className="text-destructive mb-4">No data found. Please try again.</p>
                    <Button onClick={() => window.location.reload()}>
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : viewMode === 'timeline' ? (
                <div className="h-full overflow-auto">
                  <TimelineView
                    graphData={graphData}
                    onNodeClick={handleNodeClick}
                    selectedNode={selectedNode}
                  />
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
                    hideUnconnectedNodes={hideUnconnected}
                    height={window.innerHeight - 120} // Adjust for header
                    width={window.innerWidth - (showControls ? 288 : 0) - (showDetailPanel ? window.innerWidth / 3 : 0)} // Adjust for sidebar and detail panel
                  />

                  {graphData.nodes.length > 0 && graphData.links.length === 0 && (
                    <div className="absolute top-4 left-16 bg-background/95 backdrop-blur border p-4 rounded-lg max-w-sm">
                      <h3 className="font-medium mb-2">No connections found</h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        This could be because:
                      </p>
                      <ul className="list-disc pl-8 text-muted-foreground text-sm mb-2">
                        <li>Documents do not have tags</li>
                        <li>Tags do not match any entity names</li>
                        <li>No entity files were found</li>
                      </ul>
                      <p className="text-muted-foreground text-sm">
                        Please check the Data Statistics in the controls panel for more information.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Toggle controls button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowControls(!showControls)}
                    className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur"
                    aria-label={showControls ? "Hide controls" : "Show controls"}
                  >
                    {showControls ? (
                      <ChevronLeft className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {showControls ? "Hide controls" : "Show controls"}
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Detail panel */}
            {showDetailPanel && (
              <div className="w-1/3 border-l h-full bg-background">
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
    </TooltipProvider>
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
