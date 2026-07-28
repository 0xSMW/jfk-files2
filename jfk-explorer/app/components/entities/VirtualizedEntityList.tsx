'use client';

import { Entity } from '@/app/lib/models/entity';
import EntityCard from './EntityCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface VirtualizedEntityListProps {
  entities: Entity[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export default function VirtualizedEntityList({
  entities,
  isLoading = false,
  hasMore = false,
  onLoadMore,
}: VirtualizedEntityListProps) {
  if (isLoading && entities.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-xl space-y-3 bg-card">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!isLoading && entities.length === 0) {
    return (
      <div className="p-12 text-center border rounded-xl bg-card">
        <h3 className="text-lg font-semibold mb-1">No entities found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {entities.map((entity, idx) => (
          <EntityCard key={entity.slug || entity.entity_name || idx} entity={entity} />
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={onLoadMore} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load more entities'}
          </Button>
        </div>
      )}
    </div>
  );
}
