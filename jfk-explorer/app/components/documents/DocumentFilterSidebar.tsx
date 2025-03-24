'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DocumentSearchParams } from '@/app/lib/models/document';

// Debounce utility function to delay URL updates
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeoutId: NodeJS.Timeout | null = null;
  
  const debouncedFn = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), delay);
  };
  
  // Add cancel method to the debounced function
  debouncedFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  
  return debouncedFn as typeof debouncedFn & { cancel: () => void };
}

interface DocumentFilterSidebarProps {
  documentCount: number;
  documentTypes: string[];
  availableTags: string[];
  onFilterChange: (filters: Partial<DocumentSearchParams>) => void;
  isLoading?: boolean;
}

export default function DocumentFilterSidebar({
  documentCount,
  documentTypes,
  availableTags,
  onFilterChange,
  isLoading = false
}: DocumentFilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Filter state
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState(searchParams.get('from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('to') || '');
  
  // Initialize selected tags from URL
  useEffect(() => {
    const tagsParam = searchParams.get('tags');
    if (tagsParam) {
      setSelectedTags(tagsParam.split(','));
    }
  }, [searchParams]);
  
  // Effect 1: Build filters object and notify parent when filters change
  useEffect(() => {
    const filters: Partial<DocumentSearchParams> = {};
    
    if (query) filters.query = query;
    if (selectedTags.length > 0) filters.tags = selectedTags;
    if (selectedType) filters.documentType = selectedType;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    
    onFilterChange(filters);
  }, [query, selectedTags, selectedType, dateFrom, dateTo, onFilterChange]);
  
  // Effect 2: Update URL parameters when filters change - with debounce
  useEffect(() => {
    // Create debounced function for URL updates
    const updateUrl = debounce(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (query) params.set('query', query);
      else params.delete('query');
      
      if (selectedType) params.set('type', selectedType);
      else params.delete('type');
      
      if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
      else params.delete('tags');
      
      if (dateFrom) params.set('from', dateFrom);
      else params.delete('from');
      
      if (dateTo) params.set('to', dateTo);
      else params.delete('to');
      
      const newParams = params.toString();
      const currentParams = searchParams.toString();
      
      // Only update URL if params have actually changed to prevent loops
      if (newParams !== currentParams) {
        router.replace(`${pathname}?${newParams}`, { scroll: false });
      }
    }, 300); // 300ms debounce delay
    
    // Call the debounced function
    updateUrl();
    
    // Clean up timeout on unmount
    return () => {
      updateUrl.cancel();
    };
  }, [query, selectedTags, selectedType, dateFrom, dateTo, router, pathname, searchParams]);
  
  // Handle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  // Clear all filters
  const clearFilters = () => {
    setQuery('');
    setSelectedType('');
    setSelectedTags([]);
    setDateFrom('');
    setDateTo('');
  };
  
  return (
    <div className="w-full max-w-xs bg-white rounded-lg border p-4 h-fit">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-800"
          disabled={isLoading}
        >
          Clear all
        </button>
      </div>
      
      {/* Search query */}
      <div className="mb-4">
        <label htmlFor="search-query" className="block text-sm font-medium mb-1">
          Search
        </label>
        <input
          id="search-query"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search documents..."
          className="w-full p-2 border rounded-md"
          disabled={isLoading}
          ref={inputRef}
        />
      </div>
      
      {/* Document type filter */}
      <div className="mb-4">
        <label htmlFor="document-type" className="block text-sm font-medium mb-1">
          Document Type
        </label>
        <select
          id="document-type"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full p-2 border rounded-md"
          disabled={isLoading}
        >
          <option value="">All Types</option>
          {documentTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      
      {/* Date range filter */}
      <div className="mb-4">
        <p className="block text-sm font-medium mb-1">Date Range</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="date-from" className="block text-xs mb-1">
              From
            </label>
            <input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="date-to" className="block text-xs mb-1">
              To
            </label>
            <input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
      
      {/* Tags filter */}
      <div>
        <p className="block text-sm font-medium mb-1">Tags</p>
        <div className="max-h-64 overflow-y-auto border rounded-md p-2">
          {availableTags.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">No tags available</p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  disabled={isLoading}
                  className={`text-xs px-2 py-1 rounded-md ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Document count and loading state */}
      <div className="mt-4 pt-3 border-t text-sm text-gray-500">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <p>{documentCount} document{documentCount !== 1 ? 's' : ''} found</p>
        )}
      </div>
    </div>
  );
} 