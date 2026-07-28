'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Entity } from '@/app/lib/models/entity';
import { Document } from '@/app/lib/models/document';
import RelatedDocuments from '@/app/components/entities/RelatedDocuments';
import EntityConnections from '@/app/components/entities/EntityConnections';
import Spinner from '@/app/components/Spinner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EntityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const entitySlug = params.slug as string;

  const [entity, setEntity] = useState<Entity | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEntity() {
      if (!entitySlug) return;
      try {
        setIsLoading(true);
        const res = await fetch(`/api/entities/${encodeURIComponent(entitySlug)}`);
        if (!res.ok) {
          setError('Entity not found');
          return;
        }
        const data = await res.json();
        setEntity(data.entity);
        setDocuments(data.documents || []);
      } catch (err) {
        console.error('Error fetching entity:', err);
        setError('Failed to load entity');
      } finally {
        setIsLoading(false);
      }
    }

    fetchEntity();
  }, [entitySlug]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <Spinner size="large" />
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-card rounded-xl border mt-8">
        <h2 className="text-xl font-bold text-destructive mb-2">Error</h2>
        <p className="text-muted-foreground mb-4">{error || 'Entity not found'}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/visualization?entity=${encodeURIComponent(entity.entity_name)}`}>
            View in Relationship Graph
          </Link>
        </Button>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-start border-b border-border/50 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{entity.entity_name}</h1>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              Type: <Badge variant="outline" className="ml-1 capitalize">{entity.entity_type || 'Entity'}</Badge>
            </p>
          </div>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {documents.length} Related Document{documents.length !== 1 ? 's' : ''}
          </span>
        </div>

        {entity.summary && (
          <div className="pb-4 border-b border-border/50">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Entity Summary</h3>
            <p className="text-sm text-foreground leading-relaxed">{entity.summary}</p>
          </div>
        )}

        {entity.significance && (
          <div className="pb-4 border-b border-border/50">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Historical Significance</h3>
            <p className="text-sm text-foreground leading-relaxed">{entity.significance}</p>
          </div>
        )}

        {entity.key_connections && entity.key_connections.length > 0 && (
          <EntityConnections connections={entity.key_connections} />
        )}
      </Card>

      <RelatedDocuments documents={documents} isLoading={false} />
    </div>
  );
}
