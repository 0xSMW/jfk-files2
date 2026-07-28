'use client';

import Link from 'next/link';
import { slugify } from '@/app/lib/utils/helpers';

interface ConnectionInfo {
  name: string;
  slug: string;
}

interface EntityConnectionsProps {
  connections: (ConnectionInfo | string)[];
}

export default function EntityConnections({ connections }: EntityConnectionsProps) {
  if (!connections || connections.length === 0) {
    return (
      <div className="text-muted-foreground italic text-xs">
        No connections to other entities.
      </div>
    );
  }

  const normalized = connections.map(conn => {
    if (typeof conn === 'string') {
      return { name: conn, slug: slugify(conn) };
    }
    return conn;
  });

  return (
    <div className="pt-2">
      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Key Connections</h3>
      <div className="flex flex-wrap gap-2">
        {normalized.map((conn, idx) => (
          <Link
            key={`${conn.slug}-${idx}`}
            href={`/entities/${conn.slug}`}
            className="px-2.5 py-1 bg-muted hover:bg-purple-500/15 hover:text-purple-700 dark:hover:text-purple-300 text-foreground rounded-md text-xs font-medium transition-colors"
          >
            {conn.name}
          </Link>
        ))}
      </div>
    </div>
  );
}