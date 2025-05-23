'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GraphData, GraphNode, GraphLink } from '@/app/lib/models/graph';
import { Document } from '@/app/lib/models/document';
import { Entity } from '@/app/lib/models/entity';
// Remove getFileSystemSafeName if no longer needed
// import { getFileSystemSafeName } from '@/app/lib/utils/helpers';

interface RelationshipDetailPanelProps {
  selectedNode: GraphNode | null;
  graphData: GraphData;
  onClose: () => void;
  onNodeSelect: (node: GraphNode) => void;
  onFocus?: (node: GraphNode) => void;
  inFocusMode?: boolean;
}

export default function RelationshipDetailPanel({ 
  selectedNode, 
  graphData, 
  onClose, 
  onNodeSelect,
  onFocus,
  inFocusMode = false
}: RelationshipDetailPanelProps) {
  const [connectedNodes, setConnectedNodes] = useState<Array<{node: GraphNode, link: GraphLink, isSource: boolean}>>([]);

  // Calculate connected nodes whenever selected node changes
  useEffect(() => {
    if (!selectedNode) {
      setConnectedNodes([]);
      return;
    }

    const connections = graphData.links
      .filter(link => 
        (typeof link.source === 'string' ? link.source : (link.source as any).id) === selectedNode.id ||
        (typeof link.target === 'string' ? link.target : (link.target as any).id) === selectedNode.id
      )
      .map(link => {
        const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
        const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
        const isSource = sourceId === selectedNode.id;
        const otherNodeId = isSource ? targetId : sourceId;
        const otherNode = graphData.nodes.find(n => n.id === otherNodeId);

        if (!otherNode) return null;

        return {
          node: otherNode,
          link,
          isSource
        };
      })
      .filter((item): item is {node: GraphNode, link: GraphLink, isSource: boolean} => item !== null);

    setConnectedNodes(connections);
  }, [selectedNode, graphData]);

  if (!selectedNode) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Select a node to view details</p>
      </div>
    );
  }

  const isDocument = selectedNode.type === 'document';
  const isEntity = selectedNode.type === 'entity';
  // Cast metadata, assuming it contains the full Entity or Document structure including slug etc.
  const metadata = selectedNode.metadata as (Document | (Entity & { slug?: string; key_connection_slugs?: { name: string; slug: string; }[] }));

  // Safely extract tags from document metadata
  const documentTags = isDocument ? (metadata as Document).tags || [] : [];

  // Get entity slug from the node's metadata or directly if attached
  const entitySlug = isEntity ? (metadata as Entity).slug || (selectedNode as any).slug : '';
  // Get resolved key connection slugs
  const keyConnectionSlugs = isEntity ? (metadata as Entity).key_connection_slugs || [] : [];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b bg-white flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 truncate">
            {selectedNode.label}
          </h3>
          <div className="flex mt-1">
            {isDocument && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                Document: {(metadata as Document).document_type || 'Unknown'}
              </span>
            )}

            {isEntity && (
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                Entity: {(metadata as Entity).entity_type || 'Unknown'}
              </span>
            )}
          </div>
        </div>

        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isDocument && (
          <>
            {/* Document details... */}
            <div className="mb-4">
              <div className="text-sm text-gray-700 grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <span className="font-medium">Date:</span> {(metadata as Document).date || 'Unknown'}
                </div>
                <div>
                  <span className="font-medium">Agency:</span> {(metadata as Document).origin_agency || 'Unknown'}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {(metadata as Document).document_type || 'Unknown'}
                </div>
                <div>
                  <span className="font-medium">Pages:</span> {((metadata as Document) as any).page_count || 'Unknown'}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-1">Summary</h4>
              <p className="text-sm text-gray-700">
                {(metadata as Document).summary_one_paragraph || 'No summary available.'}
              </p>
            </div>

            {isDocument && documentTags.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {documentTags.map(tag => (
                    <Link 
                      key={tag} 
                      // Link to visualization page using query param (needs encodeURIComponent)
                      href={`/visualization?entity=${encodeURIComponent(tag)}`}
                      className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 hover:bg-gray-200"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

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
            {/* Entity details... */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-1">Description</h4>
              <p className="text-sm text-gray-700">
                {(metadata as Entity).summary || 'No description available.'}
              </p>
            </div>

            {(metadata as Entity).significance && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-1">Significance</h4>
                <p className="text-sm text-gray-700">
                  {(metadata as Entity).significance}
                </p>
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">Related Documents</h4>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {(metadata as Entity).document_count || 0}
                </span>
              </div>
              {/* Consider adding a link/button to view these documents */}
            </div>

            {keyConnectionSlugs.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Key Connections</h4>
                <div className="flex flex-wrap gap-1">
                  {keyConnectionSlugs.map(connection => {
                    // Link to the entity detail page using the resolved slug
                    return (
                      <Link
                        key={connection.slug}
                        href={`/entities/${connection.slug}`}
                        className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 hover:bg-purple-200"
                      >
                        {connection.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Connected Nodes Section */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">Connected Nodes</h4>
            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
              {connectedNodes.length}
            </span>
          </div>

          {connectedNodes.length > 0 ? (
            <div className="space-y-2">
              {connectedNodes.map(({ node, link, isSource }, index) => (
                <div key={index} className="p-2 bg-white border rounded-md hover:shadow-sm transition-shadow">
                  <button
                    onClick={() => onNodeSelect(node)} // Selects node in graph
                    className="flex items-start w-full text-left"
                  >
                    <div className="w-2 h-2 mt-1.5 mr-2 rounded-full" 
                      style={{ backgroundColor: node.color || '#718096' }} 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {node.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {node.type} | {node.group} | {isSource ? `→ ${link.type || 'connected'}` : `← ${link.type || 'connected'}`}
                      </p>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-2">No connections in current view</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-3 border-t bg-gray-50 space-y-2">
        {isDocument && (
          <Link 
            href={`/documents/${(metadata as Document).id}`}
            className="w-full inline-flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Open Document
          </Link>
        )}

        {isEntity && entitySlug && ( // Check if entitySlug exists
          <Link 
            href={`/entities/${entitySlug}`} // Use the slug from the selected node
            className="w-full inline-flex justify-center items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium"
          >
            View Entity Details
          </Link>
        )}

        {onFocus && (
          <button
            onClick={() => onFocus(selectedNode)}
            className={`w-full py-2 px-4 ${
              inFocusMode 
                ? 'bg-blue-200 text-blue-800'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
            } rounded text-sm font-medium`}
          >
            {inFocusMode 
              ? 'Exit Focus Mode'
              : 'Focus on This Node'}
          </button>
        )}
      </div>
    </div>
  );
} 