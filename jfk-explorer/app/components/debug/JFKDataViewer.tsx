'use client';

import { useState, useEffect } from 'react';
import { searchDocuments } from '@/app/lib/utils/search';
import { searchEntities } from '@/app/lib/utils/search';
import { loadDocument } from '@/app/lib/utils/data-loader';
import { createRelationshipGraph } from '@/app/lib/utils/relationships';
import { Document } from '@/app/lib/models/document';
import { Entity } from '@/app/lib/models/entity';
import { RelationshipGraph } from '@/app/lib/models/relationship';

export default function JFKDataViewer() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationshipData, setRelationshipData] = useState<RelationshipGraph | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Load documents
        const docsResult = await searchDocuments({ limit: 5, page: 1 });
        setDocuments(docsResult.documents);
        
        // Load a single document with content
        if (docsResult.documents.length > 0) {
          const docWithContent = await loadDocument(docsResult.documents[0].id || '');
          if (docWithContent) {
            setDocuments(prev => [docWithContent, ...prev.slice(1)]);
          }
        }

        // Load entities
        const entitiesResult = await searchEntities({ limit: 5, page: 1 });
        setEntities(entitiesResult.entities);

        // Create relationship graph
        if (docsResult.documents.length > 0 && entitiesResult.entities.length > 0) {
          const docIds = docsResult.documents.map(doc => doc.id || '').filter(id => id !== '');
          const entityNames = entitiesResult.entities.map(entity => entity.entity_name);
          
          const graph = await createRelationshipGraph(docIds.slice(0, 2), entityNames.slice(0, 2), 1);
          setRelationshipData(graph);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Check console for details.');
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Data Validation</h2>
        <p>Loading JFK Files data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Data Validation</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Data Validation</h2>
      
      <div className="space-y-8">
        {/* Documents Section */}
        <section>
          <h3 className="text-lg font-semibold mb-2">JFK Documents ({documents.length})</h3>
          {documents.length === 0 ? (
            <p className="text-red-500">No documents found!</p>
          ) : (
            <div className="space-y-4">
              {documents.map((doc, index) => (
                <div key={doc.id || index} className="border p-4 rounded-md bg-white">
                  <h4 className="font-medium">{doc.title || 'Untitled'}</h4>
                  <p className="text-sm opacity-70">{doc.date || 'No date'}</p>
                  <p className="mt-2">{doc.summary_one_paragraph?.substring(0, 150)}...</p>
                  
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm font-medium">Tags: </span>
                      {doc.tags.slice(0, 5).map((tag, i) => (
                        <span key={i} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                          {tag}
                        </span>
                      ))}
                      {doc.tags.length > 5 && <span className="text-xs">+{doc.tags.length - 5} more</span>}
                    </div>
                  )}
                  
                  {index === 0 && doc.content && (
                    <div className="mt-2">
                      <details>
                        <summary className="cursor-pointer text-sm text-blue-600">Show document content</summary>
                        <pre className="mt-2 p-2 bg-gray-50 text-xs overflow-x-auto">
                          {doc.content.substring(0, 300)}...
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
        
        {/* Entities Section */}
        <section>
          <h3 className="text-lg font-semibold mb-2">JFK Entities ({entities.length})</h3>
          {entities.length === 0 ? (
            <p className="text-red-500">No entities found!</p>
          ) : (
            <div className="space-y-4">
              {entities.map((entity, index) => (
                <div key={index} className="border p-4 rounded-md bg-white">
                  <h4 className="font-medium">{entity.entity_name}</h4>
                  <p className="text-sm">Type: {entity.entity_type}</p>
                  <p className="text-sm">Documents: {entity.document_count}</p>
                  
                  {entity.key_connections && entity.key_connections.length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm font-medium">Connections: </span>
                      {entity.key_connections.slice(0, 3).map((connection, i) => (
                        <span key={i} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                          {connection}
                        </span>
                      ))}
                      {entity.key_connections.length > 3 && (
                        <span className="text-xs">+{entity.key_connections.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
        
        {/* Relationships Section */}
        <section>
          <h3 className="text-lg font-semibold mb-2">Document-Entity Connections</h3>
          {!relationshipData ? (
            <p className="text-red-500">No relationship data generated!</p>
          ) : (
            <div className="border p-4 rounded-md bg-white">
              <p>Nodes: {relationshipData.nodes.length}</p>
              <p>Connections: {relationshipData.edges.length}</p>
              
              <div className="mt-4">
                <h5 className="font-medium text-sm">Documents & Entities:</h5>
                <ul className="list-disc pl-5 text-sm">
                  {relationshipData.nodes.slice(0, 3).map((node, i) => (
                    <li key={i}>
                      {node.name} ({node.type})
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-4">
                <h5 className="font-medium text-sm">Relationship Data:</h5>
                <ul className="list-disc pl-5 text-sm">
                  {relationshipData.edges.slice(0, 3).map((edge, i) => (
                    <li key={i}>
                      {edge.source} → {edge.target} ({edge.type})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
} 