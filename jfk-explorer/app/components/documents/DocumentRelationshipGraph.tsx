'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Document } from '@/app/lib/models/document';
import { Entity } from '@/app/lib/models/entity';
import { GraphData, GraphNode } from '@/app/lib/models/graph';
import { generateDocumentCentricGraph } from '@/app/lib/utils/graph-transformer';
import RelationshipGraph from '@/app/components/graph/RelationshipGraph';
import Spinner from '@/app/components/Spinner';

interface DocumentRelationshipGraphProps {
  documentId: string;
}

export default function DocumentRelationshipGraph({ documentId }: DocumentRelationshipGraphProps) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState<boolean>(false);
  const [is3D, setIs3D] = useState<boolean>(false);

  useEffect(() => {
    async function loadGraphData() {
      setLoading(true);
      setError(null);
      
      try {
        const data = await generateDocumentCentricGraph(documentId);
        setGraphData(data);
      } catch (err) {
        console.error('Error loading relationship data:', err);
        setError('Failed to load relationship data');
      } finally {
        setLoading(false);
      }
    }
    
    loadGraphData();
  }, [documentId]);
  
  // Handle node click to show detail panel
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    setShowDetailPanel(true);
  };
  
  const closeDetailPanel = () => {
    setShowDetailPanel(false);
    setSelectedNode(null);
  };
  
  // Render the detail panel based on selected node
  const renderDetailPanel = () => {
    if (!selectedNode) return null;
    
    const isDocument = selectedNode.type === 'document';
    const isEntity = selectedNode.type === 'entity';
    const metadata = selectedNode.metadata as (Document | Entity);
    
    return (
      <div className="p-4 h-full overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {selectedNode.label}
          </h3>
          <button 
            onClick={closeDetailPanel}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="text-sm text-gray-600 mb-2">
          {isDocument && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              Document: {(metadata as Document).document_type}
            </span>
          )}
          {isEntity && (
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
              Entity: {(metadata as Entity).entity_type}
            </span>
          )}
        </div>
        
        {isDocument && (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Date: {(metadata as Document).date || 'Unknown'}
              </p>
              <p className="text-sm text-gray-500">
                Origin: {(metadata as Document).origin_agency || 'Unknown'}
              </p>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Summary</h4>
              <p className="text-sm text-gray-600">
                {(metadata as Document).summary_one_paragraph || 'No summary available'}
              </p>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {(metadata as Document).tags?.map(tag => (
                  <Link 
                    key={tag} 
                    href={`/visualization?entity=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 hover:bg-gray-200"
                  >
                    {tag}
                  </Link>
                )) || <span className="text-xs text-gray-500">No tags</span>}
              </div>
            </div>
            
            <div className="mt-4">
              <Link 
                href={`/documents/${(metadata as Document).id}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View full document →
              </Link>
            </div>
          </>
        )}
        
        {isEntity && (
          <>
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
              <p className="text-sm text-gray-600">
                {(metadata as Entity).summary || 'No description available'}
              </p>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Significance</h4>
              <p className="text-sm text-gray-600">
                {(metadata as Entity).significance || 'No significance information available'}
              </p>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Related to {(metadata as Entity).document_count || 0} documents</h4>
              
              {(metadata as Entity).key_connections && (metadata as Entity).key_connections.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Key connections</h4>
                  <div className="flex flex-wrap gap-1">
                    {(metadata as Entity).key_connections.map(connection => (
                      <Link 
                        key={connection}
                        href={`/visualization?entity=${encodeURIComponent(connection)}`}
                        className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 hover:bg-gray-200"
                      >
                        {connection}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4">
              <Link 
                href={`/visualization?entity=${encodeURIComponent(selectedNode.id.replace('entity-', ''))}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all relationships →
              </Link>
            </div>
          </>
        )}
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Connected In This Graph</h4>
          <div className="space-y-2">
            {graphData.links
              .filter(link => 
                link.source === selectedNode.id || 
                link.target === selectedNode.id
              )
              .map((link, index) => {
                const isSource = link.source === selectedNode.id;
                const otherNodeId = isSource ? link.target : link.source;
                const otherNode = graphData.nodes.find(n => n.id === otherNodeId);
                
                if (!otherNode) return null;
                
                return (
                  <div key={index} className="flex items-center text-sm">
                    <span className="text-gray-600">
                      {isSource ? 'Connects to' : 'Connected from'}:
                    </span>
                    <button
                      onClick={() => {
                        const node = graphData.nodes.find(n => n.id === otherNodeId);
                        if (node) handleNodeClick(node);
                      }}
                      className="ml-1 text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {otherNode.label}
                    </button>
                    <span className="ml-1 text-gray-500">
                      ({isSource ? link.type : link.type === 'mentions' ? 'mentioned in' : link.type})
                    </span>
                  </div>
                );
              })}
            
            {graphData.links.filter(link => 
              link.source === selectedNode.id || 
              link.target === selectedNode.id
            ).length === 0 && (
              <p className="text-sm text-gray-500">No connections in this graph view</p>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Calculate height taking into account potential detail panel
  const graphHeight = 450; // Fixed height for consistent layout
  
  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Document Relationships</h2>
        <p className="text-sm text-gray-600">
          Visualizing connections between this document and related entities
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Graph visualization */}
        <div className={`flex-1 ${showDetailPanel ? 'md:w-7/12' : 'w-full'}`}>
          {loading ? (
            <div className="flex items-center justify-center h-80">
              <Spinner size="medium" />
              <span className="ml-3 text-gray-600">Loading relationships...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-80">
              <p className="text-red-600">{error}</p>
            </div>
          ) : graphData.nodes.length <= 1 ? (
            <div className="flex items-center justify-center h-80 p-4 text-center">
              <div>
                <p className="text-gray-600 mb-2">No relationships found for this document</p>
                <p className="text-sm text-gray-500">This document does not have any tagged entities or connections</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <RelationshipGraph 
                graphData={graphData}
                height={graphHeight}
                onNodeClick={handleNodeClick}
                config={{
                  nodeSize: 6,
                  showLabels: true,
                  is3D: is3D
                }}
              />
              
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <button 
                  onClick={() => setIs3D(!is3D)}
                  className="bg-white text-gray-700 px-2 py-1 rounded text-sm border shadow-sm hover:bg-gray-50"
                >
                  {is3D ? "2D View" : "3D View"}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Relationship detail panel */}
        {showDetailPanel && (
          <div className="md:w-5/12 border-t md:border-t-0 md:border-l bg-gray-50">
            {renderDetailPanel()}
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 p-3 text-center border-t">
        <Link 
          href={`/visualization?document=${documentId}`}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Open in full-screen visualization →
        </Link>
      </div>
    </div>
  );
} 