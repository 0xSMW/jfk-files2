'use client';

import Link from 'next/link';

interface EntityConnectionsProps {
  connections: string[];
}

export default function EntityConnections({ connections }: EntityConnectionsProps) {
  if (!connections || connections.length === 0) {
    return (
      <div className="text-gray-500 italic">
        No connections to other entities.
      </div>
    );
  }
  
  return (
    <div className="flex flex-wrap gap-2">
      {connections.map((connection, index) => (
        <Link
          key={index}
          href={`/entities/${encodeURIComponent(connection)}`}
          className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 hover:bg-purple-200 transition-colors"
        >
          {connection}
        </Link>
      ))}
    </div>
  );
} 