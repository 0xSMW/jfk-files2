'use client';

import Link from 'next/link';

// Expect an array of objects with name and slug
interface ConnectionInfo {
  name: string;
  slug: string;
}

interface EntityConnectionsProps {
  connections: ConnectionInfo[];
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
      {connections.map((connection, index) => {
        // Use the provided slug for the href
        return (
          <Link
            key={index}
            href={`/entities/${connection.slug}`} // Use the slug from the connection object
            className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 hover:bg-purple-200 transition-colors"
          >
            {/* Display the original name */}
            {connection.name}
          </Link>
        );
      })}
    </div>
  );
} 