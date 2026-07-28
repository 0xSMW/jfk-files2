'use client';

import { Document } from '@/app/lib/models/document';
import DocumentCard from '@/app/components/documents/DocumentCard';
import Spinner from '@/app/components/Spinner';

interface RelatedDocumentsProps {
  documents?: Document[];
  isLoading?: boolean;
  error?: string | null;
}

export default function RelatedDocuments({ documents = [], isLoading = false, error = null }: RelatedDocumentsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-destructive/50 rounded-md mb-4 text-destructive text-xs">
        {error}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="p-6 bg-card border border-border rounded-lg text-center text-muted-foreground text-xs">
        No related documents found.
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-base font-bold text-foreground mb-4">Related Documents ({documents.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map(doc => (
          <DocumentCard key={doc.id} document={doc} isCompact={true} />
        ))}
      </div>
    </div>
  );
}
