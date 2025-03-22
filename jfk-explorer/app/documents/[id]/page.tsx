'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Document } from '@/app/lib/models/document';
import { getDocumentById, getRelatedDocuments } from '@/app/lib/utils/search';
import DocumentCard from '@/app/components/documents/DocumentCard';
import DocumentRelationshipGraph from '@/app/components/documents/DocumentRelationshipGraph';

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;
  
  const [document, setDocument] = useState<Document | null>(null);
  const [relatedDocuments, setRelatedDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch document data
  useEffect(() => {
    async function fetchDocument() {
      try {
        setIsLoading(true);
        
        // Get document by ID
        const doc = await getDocumentById(documentId);
        setDocument(doc);
        
        // Get related documents
        const related = await getRelatedDocuments(documentId, 5);
        setRelatedDocuments(related);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load document');
        setIsLoading(false);
      }
    }
    
    fetchDocument();
  }, [documentId]);
  
  // Navigate to the previous related document
  const navigateToPrevious = () => {
    if (relatedDocuments.length > 0) {
      router.push(`/documents/${relatedDocuments[0].id}`);
    }
  };
  
  // Navigate to the next related document
  const navigateToNext = () => {
    if (relatedDocuments.length > 1) {
      router.push(`/documents/${relatedDocuments[1].id}`);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-6 w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !document) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            {error || 'Document not found'}
          </h2>
          <p className="mb-4">The requested document could not be loaded</p>
          <Link href="/documents" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md">
            Return to Document List
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/documents" className="text-blue-600 hover:underline inline-flex items-center">
          ← Back to Document List
        </Link>
      </div>
      
      <article className="mb-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{document.title}</h1>
          
          <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600 mb-4">
            {document.date && (
              <span className="px-3 py-1 bg-gray-100 rounded-full">
                Date: {new Date(document.date).toLocaleDateString()}
              </span>
            )}
            
            {document.document_type && (
              <span className="px-3 py-1 bg-gray-100 rounded-full">
                Type: {document.document_type}
              </span>
            )}
            
            {document.origin_agency && (
              <span className="px-3 py-1 bg-gray-100 rounded-full">
                Agency: {document.origin_agency}
              </span>
            )}
          </div>
          
          {document.tags && document.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {document.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>
        
        <div className="prose max-w-none">
          {/* Display summary first */}
          {document.summary && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-2">Summary</h3>
              <p>{document.summary}</p>
            </div>
          )}
          
          {/* Main content */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold mb-4">Document Content</h3>
            <div className="whitespace-pre-wrap">
              {document.content || 'No content available for this document.'}
            </div>
          </div>
          
          {/* Document metadata */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-2">Document Metadata</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(document).map(([key, value]) => {
                // Skip certain fields we don't want to display as metadata
                if (['id', 'title', 'content', 'summary', 'tags'].includes(key) || value === undefined) {
                  return null;
                }
                
                return (
                  <div key={key} className="py-2">
                    <dt className="text-sm font-medium text-gray-500 mb-1">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </article>
      
      {/* Document Relationships Visualization */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Relationships</h2>
        <DocumentRelationshipGraph 
          documentId={documentId} 
          maxEntities={15}
          height={500}
        />
      </section>
      
      {/* Related documents */}
      {relatedDocuments.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Related Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedDocuments.map(doc => (
              <DocumentCard key={doc.id} document={doc} isCompact={true} />
            ))}
          </div>
        </section>
      )}
      
      {/* Navigation between documents */}
      <div className="flex justify-between mt-12 border-t pt-4">
        <button
          onClick={navigateToPrevious}
          disabled={relatedDocuments.length === 0}
          className={`inline-flex items-center px-4 py-2 rounded-md ${
            relatedDocuments.length > 0
              ? 'bg-gray-100 hover:bg-gray-200'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Previous Document
        </button>
        
        <button
          onClick={navigateToNext}
          disabled={relatedDocuments.length <= 1}
          className={`inline-flex items-center px-4 py-2 rounded-md ${
            relatedDocuments.length > 1
              ? 'bg-gray-100 hover:bg-gray-200'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
        >
          Next Document
          <ArrowRightIcon className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
} 