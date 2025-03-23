'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Entity, EntitySearchParams } from '@/app/lib/models/entity';
import { searchEntities } from '@/app/lib/utils/search';
import EntityFilterSidebar from '@/app/components/entities/EntityFilterSidebar';
import EntityListSorter from '@/app/components/entities/EntityListSorter';
import VirtualizedEntityList from '@/app/components/entities/VirtualizedEntityList';
import Spinner from '@/app/components/Spinner';

// Main entity list content component that uses search params
function EntitiesContent() {
  const searchParams = useSearchParams();
  
  // State for entity list
  const [entities, setEntities] = useState<Entity[]>([]);
  const [entityCount, setEntityCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters and sorting
  const [filters, setFilters] = useState<Partial<EntitySearchParams>>({});
  const [sortField, setSortField] = useState('document_count');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);
  
  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        
        // Initial entity search with empty filter
        const result = await searchEntities({ page: 1, limit: 50 });
        setEntities(result.entities);
        setEntityCount(result.total);
        
        // Extract unique entity types
        const types = new Set<string>();
        result.entities.forEach(entity => {
          if (entity.entity_type) {
            types.add(entity.entity_type);
          }
        });
        setEntityTypes(Array.from(types).sort());
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading entities:', err);
        setError('Failed to load entities');
        setIsLoading(false);
      }
    }
    
    loadInitialData();
  }, []);
  
  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<EntitySearchParams>) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);
  
  // Handle sort changes
  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
  };
  
  // Apply filters and fetch entities when filters change
  useEffect(() => {
    async function fetchFilteredEntities() {
      try {
        setIsLoading(true);
        
        // Combine filters with pagination and sorting
        const searchParams: EntitySearchParams = {
          ...filters,
          page,
          limit: 50,
          sortField,
          sortDirection
        };
        
        const result = await searchEntities(searchParams);
        setEntities(result.entities);
        setEntityCount(result.total);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching filtered entities:', err);
        setError('Failed to apply filters');
        setIsLoading(false);
      }
    }
    
    fetchFilteredEntities();
  }, [filters, page, sortField, sortDirection]);
  
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Entity Browser</h1>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-6 text-red-700">
          {error}
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar with filters */}
        <aside className="lg:w-64">
          <EntityFilterSidebar
            entityCount={entityCount}
            entityTypes={entityTypes}
            onFilterChange={handleFilterChange}
            isLoading={isLoading}
          />
        </aside>
        
        {/* Main content */}
        <main className="flex-1 border rounded-lg overflow-hidden bg-gray-50">
          {/* Sorter */}
          <EntityListSorter
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            entityCount={entityCount}
            isLoading={isLoading}
          />
          
          {/* Entity list */}
          <VirtualizedEntityList
            entities={entities}
            isLoading={isLoading}
          />
        </main>
      </div>
    </div>
  );
}

// Main page component with suspense boundary for useSearchParams
export default function EntitiesPage() {
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
      <EntitiesContent />
    </Suspense>
  );
} 