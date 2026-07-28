'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Network } from 'lucide-react';
import { Document } from '@/app/lib/models/document';
import DocumentCard from '@/app/components/documents/DocumentCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDocDate, isKnownDate } from '@/app/lib/utils/date';

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const [document, setDocument] = useState<Document | null>(null);
  const [relatedDocuments, setRelatedDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocument() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/documents/${encodeURIComponent(documentId)}`);
        if (!res.ok) {
          setError('Document not found');
          return;
        }
        const data = await res.json();
        setDocument(data.document);
        setRelatedDocuments(data.related || []);
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load document');
      } finally {
        setIsLoading(false);
      }
    }

    if (documentId) {
      fetchDocument();
    }
  }, [documentId]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-56" />
        </div>
        <div className="rounded-xl border bg-card p-6 space-y-6">
          <div className="space-y-2 border-b border-border/50 pb-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <h2 className="text-xl font-semibold text-destructive">Error</h2>
          <p className="text-sm text-muted-foreground">{error || 'Document not found'}</p>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/visualization?document=${encodeURIComponent(document.id)}`}>
            <Network className="h-4 w-4" />
            View in Relationship Graph
          </Link>
        </Button>
      </div>

      <Card className="p-6 space-y-6">
        <div className="flex justify-between items-start gap-4 border-b border-border/50 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{document.title || document.id}</h1>
            <p className="text-xs text-muted-foreground mt-1">
              ID: {document.id} &bull; Type: {document.document_type || 'Document'}
            </p>
          </div>
          {document.security_level && (
            <Badge variant="destructive" className="uppercase shrink-0">
              {document.security_level}
            </Badge>
          )}
        </div>

        {document.summary_one_paragraph && (
          <div className="bg-muted p-4 rounded-r-lg border-l-4 border-primary">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Executive Summary
            </h3>
            <p className="text-sm leading-relaxed">{document.summary_one_paragraph}</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/50">
          <div className="px-4 first:pl-0">
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Date</span>
            <span className={`text-sm font-medium ${!isKnownDate(document.date) ? 'text-muted-foreground' : ''}`}>
              {formatDocDate(document.date)}
            </span>
          </div>
          <div className="px-4">
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Origin Agency</span>
            <span className="text-sm font-medium">{document.origin_agency || 'Unknown'}</span>
          </div>
          <div className="px-4">
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Sender</span>
            <span className="text-sm font-medium truncate block">{document.sender || 'N/A'}</span>
          </div>
          <div className="px-4">
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Recipient</span>
            <span className="text-sm font-medium truncate block">{document.recipient || 'N/A'}</span>
          </div>
        </div>

        {document.content && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Declassified Content</h3>
            <ScrollArea className="h-96">
              <div className="rounded-lg bg-muted dark:bg-muted/50 border font-mono text-xs leading-relaxed p-4 whitespace-pre-wrap">
                {document.content}
              </div>
            </ScrollArea>
          </div>
        )}
      </Card>

      {relatedDocuments.length > 0 && (
        <Card className="p-6">
          <h3 className="text-base font-semibold mb-4">Related Documents ({relatedDocuments.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedDocuments.map(rel => (
              <DocumentCard key={rel.id} document={rel} isCompact />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
