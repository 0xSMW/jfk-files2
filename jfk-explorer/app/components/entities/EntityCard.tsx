import Link from 'next/link';
import { Entity } from '@/app/lib/models/entity';

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
  } = entity;

  // Limit summary length for compact display
  const displaySummary = isCompact
    ? summary?.slice(0, 120)
    : summary;

  return (
    <Link
      href={`/entities/${encodeURIComponent(entity_name)}`}
      className="block border rounded-lg overflow-hidden transition-shadow hover:shadow-md bg-white"
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium leading-tight line-clamp-2">
            {entity_name}
          </h3>
          
          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 whitespace-nowrap ml-2">
            {entity_type}
          </span>
        </div>
        
        <div className="mt-1 flex items-center text-sm text-gray-500">
          <span>{document_count} document{document_count !== 1 ? 's' : ''}</span>
        </div>
        
        {displaySummary && (
          <p className={`mt-3 ${isCompact ? 'line-clamp-2 text-sm' : 'line-clamp-3'} text-gray-600`}>
            {displaySummary}
          </p>
        )}
        
        {key_connections && key_connections.length > 0 && !isCompact && (
          <div className="mt-4 flex flex-wrap gap-1">
            {key_connections.slice(0, 3).map((connection, i) => (
              <span key={i} className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                {connection}
              </span>
            ))}
            {key_connections.length > 3 && (
              <span className="inline-block text-xs px-2 py-1 text-gray-500">
                +{key_connections.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
} 