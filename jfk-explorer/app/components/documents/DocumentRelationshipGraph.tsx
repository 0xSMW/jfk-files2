'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RelationshipGraph from '@/app/components/graph/RelationshipGraph';
import { generateDocumentCentricGraph } from '@/app/lib/utils/graph-transformer';
import { GraphData, GraphNode } from '@/app/lib/models/graph';
import Spinner from '@/app/components/Spinner';

interface DocumentRelationshipGraphProps {
  documentId: string;
  maxEntities?: number;
  height?: number;
}

export default function DocumentRelationshipGraph({
  documentId,
  maxEntities = 10,
  height = 400
}: DocumentRelationshipGraphProps) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  
  // Load document-centric graph
  useEffect(() => {
    async function loadGraphData() {
      setLoading(true);
      setError(null);
      
      try {
        const data = await generateDocumentCentricGraph(documentId, maxEntities);
        setGraphData(data);
      } catch (err) {
        console.error('Error loading graph data:', err);
        setError('Failed to load relationship data.');
      } finally {
        setLoading(false);
      }
    }
    
    loadGraphData();
  }, [documentId, maxEntities]);
  
  // Handle node click
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };
  
  return (
    <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
      <div className="border-b px-4 py-3 flex justify-between items-center">
        <h3 className="font-medium text-gray-900">Document Relationships</h3>
        <Link 
          href={`/visualization?document=${documentId}`}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View Full Screen
        </Link>
      </div>
      
      <div style={{ height: `${height}px` }} className="relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner size="medium" />
            <span className="ml-2 text-gray-600">Loading relationship data...</span>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-2">{error}</p>
              <button 
                onClick={() => {
                  setLoading(true);
                  generateDocumentCentricGraph(documentId, maxEntities)
                    .then(data => {
                      setGraphData(data);
                      setError(null);
                    })
                    .catch(err => {
                      console.error('Error reloading graph data:', err);
                      setError('Failed to load relationship data.');
                    })
                    .finally(() => setLoading(false));
                }}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : graphData.nodes.length <= 1 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">No relationships found for this document.</p>
          </div>
        ) : (
          <RelationshipGraph 
            graphData={graphData}
            height={height}
            config={{
              nodeSize: 5,
              showLabels: true,
              colorByGroup: true,
              chargeStrength: -150,
              linkDistance: 80,
              is3D: false
            }}
            onNodeClick={handleNodeClick}
          />
        )}
      </div>
      
      {selectedNode && selectedNode.type === 'entity' && (
        <div className="border-t p-3 bg-gray-50">
          <h4 className="font-medium text-sm text-gray-900">{selectedNode.label}</h4>
          <p className="text-xs text-gray-600">Type: {selectedNode.group}</p>
          <div className="mt-2 flex justify-end">
            <Link 
              href={`/entities/${selectedNode.label}`}
              className="text-xs px-2 py-1 bg-white border rounded text-blue-600 hover:text-blue-800 hover:border-blue-300"
            >
              View Entity Details
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 