'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Entity } from '@/app/lib/models/entity';
// Import the correct function for loading by slug
import { loadEntityBySlug } from '@/app/lib/utils/data-loader';
import RelatedDocuments from '@/app/components/entities/RelatedDocuments';
import EntityConnections from '@/app/components/entities/EntityConnections';
import Spinner from '@/app/components/Spinner';

export default function EntityDetailPage() {
  const params = useParams();
  // Use 'slug' from the route directory name
  const entitySlug = params.slug as string;

  const [entity, setEntity] = useState<Entity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch entity data using the slug
  useEffect(() => {
    async function fetchEntity() {
      if (!entitySlug) {
        setError('Entity slug is missing.');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        // Fetch entity by slug using the correct function
        const entityData = await loadEntityBySlug(entitySlug);

        if (entityData) {
          setEntity(entityData);
        } else {
          // Use standard quotes for the string literal
          setError(`Entity with slug "${entitySlug}" not found`);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching entity by slug:', err);
        setError('Failed to load entity data');
        setIsLoading(false);
      }
    }

    fetchEntity();
  }, [entitySlug]);

  if (isLoading) {
    return (
      // Use standard quotes for className
      <div className="flex justify-center items-center h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  if (error || !entity) {
    return (
      // Use standard quotes for className
      <div className="container mx-auto py-8 px-4">
        <Link href="/entities" className="text-blue-600 hover:underline mb-8 inline-block">
          ← Back to Entities
        </Link>

        {/* Use standard quotes for className */}
        <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error || 'Entity not found'}
        </div>
      </div>
    );
  }

  // Ensure key_connection_slugs is an array, default to empty if undefined
  // This assumes data-loader populates key_connection_slugs correctly
  const connectionsWithSlugs = entity.key_connection_slugs || [];

  return (
    // Use standard quotes for className
    <div className="container mx-auto py-8 px-4">
      <Link href="/entities" className="text-blue-600 hover:underline mb-8 inline-block">
        ← Back to Entities
      </Link>

      {/* Use standard quotes for className */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {/* Use standard quotes for className */}
        <div className="p-6">
          {/* Use standard quotes for className */}
          <div className="flex justify-between items-start mb-4">
            {/* Use standard quotes for className */}
            <h1 className="text-3xl font-bold">{entity.entity_name}</h1>

            {/* Use standard quotes for className */}
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-sm font-medium text-purple-800">
              {entity.entity_type}
            </span>
          </div>

          {/* Use standard quotes for className */}
          <div className="mb-6">
            {/* Use standard quotes for className */}
            <h2 className="text-xl font-semibold mb-2">Overview</h2>
            {/* Use standard quotes for className */}
            <p className="text-gray-700">{entity.summary}</p>
          </div>

          {entity.significance && (
            // Use standard quotes for className
            <div className="mb-6">
              {/* Use standard quotes for className */}
              <h2 className="text-xl font-semibold mb-2">Significance</h2>
              {/* Use standard quotes for className */}
              <p className="text-gray-700">{entity.significance}</p>
            </div>
          )}

          {/* Use standard quotes for className */}
          <div className="mb-6">
            {/* Use standard quotes for className */}
            <h2 className="text-xl font-semibold mb-2">Key Connections</h2>
            {/* Pass the resolved slugs and names to EntityConnections */}
            <EntityConnections connections={connectionsWithSlugs} />
          </div>
        </div>
      </div>

      {/* Use standard quotes for className */}
      <div className="mt-8">
        {/* Use standard quotes for className */}
        <h2 className="text-2xl font-bold mb-4">Related Documents ({entity.document_count})</h2>
        <RelatedDocuments documentIds={entity.document_ids || []} />
      </div>

      {/* Use standard quotes for className */}
      <div className="mt-8 mb-4">
        <Link
          // Link to visualization still uses entity_name for the query param
          href={`/visualization?entity=${encodeURIComponent(entity.entity_name)}`}
          // Use standard quotes for className
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          View in Relationship Graph
        </Link>
      </div>
    </div>
  );
}