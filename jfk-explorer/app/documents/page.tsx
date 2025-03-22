'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Document, DocumentSearchParams } from '@/app/lib/models/document';
import { searchDocuments } from '@/app/lib/utils/search';
import DocumentFilterSidebar from '@/app/components/documents/DocumentFilterSidebar';
import VirtualizedDocumentList from '@/app/components/documents/VirtualizedDocumentList';
import DocumentListSorter from '@/app/components/documents/DocumentListSorter';

export default function DocumentsPage() {
  // Get search params from URL
  const searchParams = useSearchParams();
  
  // State for document list
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentCount, setDocumentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters and sorting
  const [filters, setFilters] = useState<Partial<DocumentSearchParams>>({});
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        
        // Initial document search with empty filter
        const result = await searchDocuments({ page: 1, limit: 50 });
        setDocuments(result.documents);
        setDocumentCount(result.total);
        
        // Extract unique document types
        const types = new Set<string>();
        result.documents.forEach(doc => {
          if (doc.document_type) {
            types.add(doc.document_type);
          }
        });
        setDocumentTypes(Array.from(types).sort());
        
        // Extract unique tags
        const tags = new Set<string>();
        result.documents.forEach(doc => {
          if (doc.tags) {
            doc.tags.forEach(tag => tags.add(tag));
          }
        });
        setAvailableTags(Array.from(tags).sort());
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading documents:', err);
        setError('Failed to load documents');
        setIsLoading(false);
      }
    }
    
    loadInitialData();
  }, []);
  
  // Handle filter changes - memoize with useCallback
  const handleFilterChange = useCallback((newFilters: Partial<DocumentSearchParams>) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);
  
  // Handle sort changes
  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
  };
  
  // Apply filters and fetch documents when filters change
  useEffect(() => {
    async function fetchFilteredDocuments() {
      try {
        setIsLoading(true);
        
        // Combine filters with pagination and sorting
        const searchParams: DocumentSearchParams = {
          ...filters,
          page,
          limit: 50
        };
        
        const result = await searchDocuments(searchParams);
        
        // Sort documents
        let sortedDocuments = [...result.documents];
        sortedDocuments.sort((a, b) => {
          let valueA = a[sortField as keyof Document];
          let valueB = b[sortField as keyof Document];
          
          // Handle undefined values
          if (valueA === undefined) return sortDirection === 'asc' ? -1 : 1;
          if (valueB === undefined) return sortDirection === 'asc' ? 1 : -1;
          
          // Convert to strings for comparison
          valueA = String(valueA).toLowerCase();
          valueB = String(valueB).toLowerCase();
          
          // Compare based on direction
          if (sortDirection === 'asc') {
            return valueA.localeCompare(valueB);
          } else {
            return valueB.localeCompare(valueA);
          }
        });
        
        setDocuments(sortedDocuments);
        setDocumentCount(result.total);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching filtered documents:', err);
        setError('Failed to apply filters');
        setIsLoading(false);
      }
    }
    
    fetchFilteredDocuments();
  }, [filters, page, sortField, sortDirection]);
  
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">JFK Document Browser</h1>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-6 text-red-700">
          {error}
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar with filters */}
        <aside className="lg:w-64">
          <DocumentFilterSidebar
            documentCount={documentCount}
            documentTypes={documentTypes}
            availableTags={availableTags}
            onFilterChange={handleFilterChange}
            isLoading={isLoading}
          />
        </aside>
        
        {/* Main content */}
        <main className="flex-1 border rounded-lg overflow-hidden bg-gray-50">
          {/* Sorter */}
          <DocumentListSorter
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            documentCount={documentCount}
            isLoading={isLoading}
          />
          
          {/* Document list */}
          <VirtualizedDocumentList
            documents={documents}
            isLoading={isLoading}
          />
        </main>
      </div>
    </div>
  );
} 