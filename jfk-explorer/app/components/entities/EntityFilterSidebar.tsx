'use client';

import { useState, useEffect } from 'react';
import { EntitySearchParams } from '@/app/lib/models/entity';

interface EntityFilterSidebarProps {
  entityCount: number;
  entityTypes: string[];
  onFilterChange: (filters: Partial<EntitySearchParams>) => void;
  isLoading?: boolean;
}

export default function EntityFilterSidebar({
  entityCount,
  entityTypes = [],
  onFilterChange,
  isLoading = false
}: EntityFilterSidebarProps) {
  // Local state for search input
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [docCountMin, setDocCountMin] = useState<string>('');
  const [docCountMax, setDocCountMax] = useState<string>('');
  
  // Apply filters when any filter value changes
  useEffect(() => {
    const filters: Partial<EntitySearchParams> = {};
    
    if (searchQuery) {
      filters.query = searchQuery;
    }
    
    if (selectedType) {
      filters.type = selectedType;
    }
    
    if (docCountMin || docCountMax) {
      filters.documentCount = {};
      if (docCountMin) {
        filters.documentCount.min = parseInt(docCountMin, 10);
      }
      if (docCountMax) {
        filters.documentCount.max = parseInt(docCountMax, 10);
      }
    }
    
    onFilterChange(filters);
  }, [searchQuery, selectedType, docCountMin, docCountMax, onFilterChange]);
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setDocCountMin('');
    setDocCountMax('');
  };
  
  return (
    <div className="bg-white p-4 rounded-lg border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Filters</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-800"
          disabled={isLoading}
        >
          Clear all
        </button>
      </div>
      
      {/* Search filter */}
      <div className="mb-6">
        <label htmlFor="entity-search" className="block text-sm font-medium text-gray-700 mb-1">
          Search
        </label>
        <input
          id="entity-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search entities..."
          className="w-full px-3 py-2 border rounded-md text-sm"
          disabled={isLoading}
        />
      </div>
      
      {/* Entity type filter */}
      <div className="mb-6">
        <label htmlFor="entity-type" className="block text-sm font-medium text-gray-700 mb-1">
          Entity Type
        </label>
        <select
          id="entity-type"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm"
          disabled={isLoading}
        >
          <option value="">All types</option>
          {entityTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      
      {/* Document count filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Document Count
        </label>
        <div className="flex space-x-2">
          <div className="w-1/2">
            <label htmlFor="doc-count-min" className="sr-only">Minimum</label>
            <input
              id="doc-count-min"
              type="number"
              min="0"
              value={docCountMin}
              onChange={(e) => setDocCountMin(e.target.value)}
              placeholder="Min"
              className="w-full px-3 py-2 border rounded-md text-sm"
              disabled={isLoading}
            />
          </div>
          <div className="w-1/2">
            <label htmlFor="doc-count-max" className="sr-only">Maximum</label>
            <input
              id="doc-count-max"
              type="number"
              min="0"
              value={docCountMax}
              onChange={(e) => setDocCountMax(e.target.value)}
              placeholder="Max"
              className="w-full px-3 py-2 border rounded-md text-sm"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
      
      {/* Results count */}
      <div className="pt-4 border-t text-sm text-gray-500">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <p>{entityCount} result{entityCount !== 1 ? 's' : ''}</p>
        )}
      </div>
    </div>
  );
} 