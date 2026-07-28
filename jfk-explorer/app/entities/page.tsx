'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { Entity, EntitySearchParams } from '@/app/lib/models/entity';
import EntityFilterSidebar from '@/app/components/entities/EntityFilterSidebar';
import EntityListSorter from '@/app/components/entities/EntityListSorter';
import VirtualizedEntityList from '@/app/components/entities/VirtualizedEntityList';
import { Skeleton } from '@/components/ui/skeleton';

function EntitiesContent() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [entityCount, setEntityCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Partial<EntitySearchParams>>({});
  const [sortField, setSortField] = useState('document_count');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);

  // Fetch entities via API route with cancellation
  useEffect(() => {
    const controller = new AbortController();

    async function fetchEntities() {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', '50');
        if (filters.query) params.set('query', filters.query);
        if (filters.type) params.set('type', filters.type);

        params.set('sortField', sortField);
        params.set('sortDirection', sortDirection);

        const res = await fetch(`/api/entities?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to fetch entities');
        const data = await res.json();

        setEntities(prev => (page > 1 ? [...prev, ...data.entities] : data.entities));
        setEntityCount(data.total);
        if (data.entityTypes) setEntityTypes(data.entityTypes);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error loading entities:', err);
          setError('Failed to load entities');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchEntities();
    return () => controller.abort();
  }, [filters, page, sortField, sortDirection]);

  const handleFilterChange = useCallback((newFilters: Partial<EntitySearchParams>) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Historical Entities & Key Figures</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Explore {entityCount.toLocaleString()} indexed individuals, organizations, and key locations
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0">
          <EntityFilterSidebar
            entityCount={entityCount}
            entityTypes={entityTypes}
            onFilterChange={handleFilterChange}
            isLoading={isLoading}
          />
        </div>

        <div className="flex-1 space-y-4 min-w-0">
          <EntityListSorter
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            entityCount={entityCount}
            isLoading={isLoading}
          />

          {error ? (
            <div className="p-8 text-center text-destructive border rounded-xl bg-card">
              {error}
            </div>
          ) : (
            <VirtualizedEntityList
              entities={entities}
              isLoading={isLoading}
              hasMore={entities.length < entityCount}
              onLoadMore={() => setPage(p => p + 1)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function EntitiesPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
    }>
      <EntitiesContent />
    </Suspense>
  );
}
