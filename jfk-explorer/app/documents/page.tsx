'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { Document, DocumentSearchParams } from '@/app/lib/models/document';
import DocumentFilterSidebar from '@/app/components/documents/DocumentFilterSidebar';
import VirtualizedDocumentList from '@/app/components/documents/VirtualizedDocumentList';
import DocumentListSorter from '@/app/components/documents/DocumentListSorter';
import { Skeleton } from '@/components/ui/skeleton';

function DocumentsContent() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentCount, setDocumentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Partial<DocumentSearchParams>>({});
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDocuments() {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', '50');
        if (filters.query) params.set('query', filters.query);
        if (filters.documentType) params.set('documentType', filters.documentType);
        if (filters.tags?.length) params.set('tags', filters.tags.join(','));
        if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.set('dateTo', filters.dateTo);

        const sortKey = sortField === 'date' ? 'date' : sortField === 'document_type' ? 'type' : 'title';
        params.set('sortBy', `${sortKey}_${sortDirection}`);

        const res = await fetch(`/api/documents?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to fetch documents');
        const data = await res.json();

        setDocuments(prev => (page > 1 ? [...prev, ...data.documents] : data.documents));
        setDocumentCount(data.total);
        if (data.documentTypes) setDocumentTypes(data.documentTypes);
        if (data.availableTags) setAvailableTags(data.availableTags);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error loading documents:', err);
          setError('Failed to load documents');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocuments();
    return () => controller.abort();
  }, [filters, page, sortField, sortDirection]);

  const handleFilterChange = useCallback((newFilters: Partial<DocumentSearchParams>) => {
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
        <h1 className="text-3xl font-semibold tracking-tight">JFK Assassination Documents</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse and filter through {documentCount.toLocaleString()} official declassified records
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0">
          <DocumentFilterSidebar
            documentCount={documentCount}
            documentTypes={documentTypes}
            availableTags={availableTags}
            onFilterChange={handleFilterChange}
            isLoading={isLoading}
          />
        </div>

        <div className="flex-1 space-y-4 min-w-0">
          <DocumentListSorter
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            documentCount={documentCount}
            isLoading={isLoading}
          />

          {error ? (
            <div className="p-8 text-center text-destructive border rounded-xl bg-card">
              {error}
            </div>
          ) : (
            <VirtualizedDocumentList
              documents={documents}
              isLoading={isLoading}
              hasMore={documents.length < documentCount}
              onLoadMore={() => setPage(p => p + 1)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
    }>
      <DocumentsContent />
    </Suspense>
  );
}
