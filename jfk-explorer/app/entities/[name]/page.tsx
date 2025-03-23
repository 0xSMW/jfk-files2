'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Entity } from '@/app/lib/models/entity';
import { loadEntity } from '@/app/lib/utils/data-loader';
import RelatedDocuments from '@/app/components/entities/RelatedDocuments';
import EntityConnections from '@/app/components/entities/EntityConnections';
import Spinner from '@/app/components/Spinner';

export default function EntityDetailPage() {
  const params = useParams();
  const entityName = params.name as string;
  
  const [entity, setEntity] = useState<Entity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch entity data
  useEffect(() => {
    async function fetchEntity() {
      try {
        setIsLoading(true);
        
        // Decode the entity name from the URL
        const decodedName = decodeURIComponent(entityName);
        
        // Get entity by name
        const entityData = await loadEntity(decodedName);
        
        if (entityData) {
          setEntity(entityData);
        } else {
          setError(`Entity "${decodedName}" not found`);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching entity:', err);
        setError('Failed to load entity data');
        setIsLoading(false);
      }
    }
    
    if (entityName) {
      fetchEntity();
    }
  }, [entityName]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="large" />
      </div>
    );
  }
  
  if (error || !entity) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Link href="/entities" className="text-blue-600 hover:underline mb-8 inline-block">
          ← Back to Entities
        </Link>
        
        <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error || 'Entity not found'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Link href="/entities" className="text-blue-600 hover:underline mb-8 inline-block">
        ← Back to Entities
      </Link>
      
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{entity.entity_name}</h1>
            
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-sm font-medium text-purple-800">
              {entity.entity_type}
            </span>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Overview</h2>
            <p className="text-gray-700">{entity.summary}</p>
          </div>
          
          {entity.significance && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Significance</h2>
              <p className="text-gray-700">{entity.significance}</p>
            </div>
          )}
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Key Connections</h2>
            <EntityConnections connections={entity.key_connections || []} />
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Related Documents ({entity.document_count})</h2>
        <RelatedDocuments documentIds={entity.document_ids || []} />
      </div>
      
      <div className="mt-8 mb-4">
        <Link
          href={`/visualization?entity=${encodeURIComponent(entity.entity_name)}`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          View in Relationship Graph
        </Link>
      </div>
    </div>
  );
} 