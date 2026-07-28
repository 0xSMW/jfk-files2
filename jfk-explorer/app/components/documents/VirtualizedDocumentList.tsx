'use client';

import { Document } from '@/app/lib/models/document';
import DocumentCard from './DocumentCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface VirtualizedDocumentListProps {
  documents: Document[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export default function VirtualizedDocumentList({
  documents,
  isLoading = false,
  hasMore = false,
  onLoadMore,
}: VirtualizedDocumentListProps) {
  if (isLoading && documents.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-xl space-y-3 bg-card">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-16 w-full" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!isLoading && documents.length === 0) {
    return (
      <div className="p-12 text-center border rounded-xl bg-card">
        <h3 className="text-lg font-semibold mb-1">No documents found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your search filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {documents.map((doc) => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={onLoadMore} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load more documents'}
          </Button>
        </div>
      )}
    </div>
  );
}
