'use client';

import { useState, useEffect } from 'react';
import { Document } from '@/app/lib/models/document';
import { loadDocumentMetadata } from '@/app/lib/utils/data-loader';
import DocumentCard from '@/app/components/documents/DocumentCard';
import Spinner from '@/app/components/Spinner';

interface RelatedDocumentsProps {
  documentIds: string[];
  limit?: number;
}

export default function RelatedDocuments({ documentIds, limit = 6 }: RelatedDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadDocuments() {
      try {
        setIsLoading(true);
        
        // Only load up to the limit
        const idsToLoad = documentIds.slice(0, limit);
        
        const loadedDocs = await Promise.all(
          idsToLoad.map(async (id) => {
            const doc = await loadDocumentMetadata(id);
            return doc;
          })
        );
        
        // Filter out null documents
        const validDocs = loadedDocs.filter((doc): doc is Document => doc !== null);
        
        setDocuments(validDocs);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading related documents:', err);
        setError('Failed to load related documents');
        setIsLoading(false);
      }
    }
    
    if (documentIds && documentIds.length > 0) {
      loadDocuments();
    } else {
      setIsLoading(false);
    }
  }, [documentIds, limit]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4 text-red-700">
        {error}
      </div>
    );
  }
  
  if (documents.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No related documents found.
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map(doc => (
        <DocumentCard key={doc.id} document={doc} isCompact={true} />
      ))}
    </div>
  );
} 