import Link from 'next/link';
import { Entity } from '@/app/lib/models/entity';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EntityCardProps {
  entity: Entity;
  isCompact?: boolean;
}

export default function EntityCard({ entity, isCompact = false }: EntityCardProps) {
  const {
    entity_name,
    entity_type,
    summary,
    document_count,
    key_connections,
    slug, // Use the slug from the entity object
  } = entity;

  // Limit summary length for compact display
  const displaySummary = isCompact
    ? summary?.slice(0, 120)
    : summary;

  // Use the actual slug from the entity data, ensure it exists
  const entityLink = slug ? `/entities/${slug}` : '#'; // Fallback if slug is missing

  return (
    <Link
      href={entityLink} // Use the slug from the entity object
      className={cn('block', !slug && 'pointer-events-none opacity-50')} // Disable link if slug missing
    >
      <Card className="p-4 transition-colors hover:bg-muted/50">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-medium leading-tight line-clamp-2">
            {entity_name}
          </h3>

          <Badge variant="outline" className="whitespace-nowrap shrink-0">
            {entity_type}
          </Badge>
        </div>

        <div className="mt-1 flex items-center text-sm text-muted-foreground">
          <span>{document_count} document{document_count !== 1 ? 's' : ''}</span>
        </div>

        {displaySummary && (
          <p className={cn('mt-3 text-muted-foreground', isCompact ? 'line-clamp-2 text-sm' : 'line-clamp-3')}>
            {displaySummary}
          </p>
        )}

        {/* Key connections display remains the same, showing names */}
        {key_connections && key_connections.length > 0 && !isCompact && (
          <div className="mt-4 flex flex-wrap gap-1">
            {key_connections.slice(0, 3).map((connection, i) => (
              <Badge key={i} variant="secondary" className="font-normal">
                {connection}
              </Badge>
            ))}
            {key_connections.length > 3 && (
              <span className="inline-block text-xs px-2 py-1 text-muted-foreground">
                +{key_connections.length - 3} more
              </span>
            )}
          </div>
        )}
      </Card>
    </Link>
  );
}
