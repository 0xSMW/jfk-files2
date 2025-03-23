'use client';

import { useState, useEffect } from 'react';
import { GraphFilterOptions } from '@/app/lib/models/graph';

interface FilterControlsProps {
  filterOptions: GraphFilterOptions;
  onChange: (filters: Partial<GraphFilterOptions>) => void;
  statistics: {
    totalDocuments: number;
    documentsWithTags: number;
    uniqueTags: number;
    totalEntities: number;
    matchingTags: number;
  } | null;
}

export default function FilterControls({ 
  filterOptions, 
  onChange,
  statistics
}: FilterControlsProps) {
  // Local state for document types filter
  const [documentTypes, setDocumentTypes] = useState<string[]>(filterOptions.documentTypes || []);
  // Local state for entity types filter
  const [entityTypes, setEntityTypes] = useState<string[]>(filterOptions.entityTypes || []);
  // Local state for search
  const [searchQuery, setSearchQuery] = useState<string>(filterOptions.searchQuery || '');
  
  // Common document types in the JFK Files
  const commonDocumentTypes = ['Report', 'Memo', 'Letter', 'Transcript', 'Interview', 'Medical Report'];
  // Common entity types
  const commonEntityTypes = ['Person', 'Organization', 'Location', 'Event'];
  
  // Update local state when props change, but only if they're different
  useEffect(() => {
    const docTypesChanged = 
      JSON.stringify(documentTypes) !== JSON.stringify(filterOptions.documentTypes || []);
    const entityTypesChanged = 
      JSON.stringify(entityTypes) !== JSON.stringify(filterOptions.entityTypes || []);
    const searchChanged = searchQuery !== (filterOptions.searchQuery || '');
    
    if (docTypesChanged) {
      setDocumentTypes(filterOptions.documentTypes || []);
    }
    if (entityTypesChanged) {
      setEntityTypes(filterOptions.entityTypes || []);
    }
    if (searchChanged) {
      setSearchQuery(filterOptions.searchQuery || '');
    }
  }, [filterOptions, documentTypes, entityTypes, searchQuery]);
  
  // Handle document type filter change
  const handleDocTypeChange = (type: string) => {
    const newDocTypes = documentTypes.includes(type)
      ? documentTypes.filter(t => t !== type)
      : [...documentTypes, type];
    
    setDocumentTypes(newDocTypes);
    onChange({
      ...filterOptions,
      documentTypes: newDocTypes
    });
  };
  
  // Handle entity type filter change
  const handleEntityTypeChange = (type: string) => {
    const newEntityTypes = entityTypes.includes(type)
      ? entityTypes.filter(t => t !== type)
      : [...entityTypes, type];
    
    setEntityTypes(newEntityTypes);
    onChange({
      ...filterOptions,
      entityTypes: newEntityTypes
    });
  };
  
  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    
    // Debounce search to avoid too many updates
    const timeoutId = setTimeout(() => {
      onChange({
        ...filterOptions,
        searchQuery: newValue
      });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setDocumentTypes([]);
    setEntityTypes([]);
    setSearchQuery('');
    
    onChange({
      ...filterOptions,
      documentTypes: [],
      entityTypes: [],
      searchQuery: ''
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Search</h3>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by title or content..."
            className="w-full p-2 pl-8 border rounded-md text-sm"
          />
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 absolute left-2 top-2.5 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Document Types</h3>
        <div className="space-y-1">
          {commonDocumentTypes.map(type => (
            <label key={type} className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={documentTypes.includes(type)}
                onChange={() => handleDocTypeChange(type)}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Entity Types</h3>
        <div className="space-y-1">
          {commonEntityTypes.map(type => (
            <label key={type} className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={entityTypes.includes(type)}
                onChange={() => handleEntityTypeChange(type)}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>
      
      {(documentTypes.length > 0 || entityTypes.length > 0 || searchQuery) && (
        <button
          onClick={handleResetFilters}
          className="mt-2 w-full py-1 px-3 bg-gray-100 hover:bg-gray-200 text-sm rounded-md"
        >
          Reset Filters
        </button>
      )}
      
      {statistics && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Data Statistics</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Total Documents: {statistics.totalDocuments}</p>
            <p>Documents with Tags: {statistics.documentsWithTags}</p>
            <p>Unique Tags: {statistics.uniqueTags}</p>
            <p>Total Entities: {statistics.totalEntities}</p>
            <p>Matching Tags: {statistics.matchingTags}</p>
          </div>
        </div>
      )}
    </div>
  );
} 