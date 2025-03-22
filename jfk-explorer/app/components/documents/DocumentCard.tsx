import Link from 'next/link';
import { Document } from '@/app/lib/models/document';

interface DocumentCardProps {
  document: Document;
  isCompact?: boolean;
}

export default function DocumentCard({ document, isCompact = false }: DocumentCardProps) {
  const {
    id,
    title,
    date,
    summary,
    summary_one_paragraph,
    tags,
    document_type,
    origin_agency
  } = document;

  // Use a shorter summary for compact view
  const displaySummary = isCompact
    ? (summary?.slice(0, 120) || summary_one_paragraph?.slice(0, 120))
    : (summary_one_paragraph || summary);

  return (
    <Link
      href={`/documents/${id}`}
      className="block border rounded-lg overflow-hidden transition-shadow hover:shadow-md bg-white"
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium leading-tight line-clamp-2">
            {title || 'Untitled Document'}
          </h3>
          
          {!isCompact && (
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 whitespace-nowrap ml-2">
              {document_type || 'Document'}
            </span>
          )}
        </div>
        
        <div className="mt-1 flex items-center text-sm text-gray-500 gap-3">
          <span>{date || 'Unknown date'}</span>
          {origin_agency && !isCompact && (
            <>
              <span>•</span>
              <span>{origin_agency}</span>
            </>
          )}
        </div>
        
        {displaySummary && (
          <p className={`mt-3 ${isCompact ? 'line-clamp-2 text-sm' : 'line-clamp-3'} text-gray-600`}>
            {displaySummary}
          </p>
        )}
        
        {tags && tags.length > 0 && !isCompact && (
          <div className="mt-4 flex flex-wrap gap-1">
            {tags.slice(0, 5).map((tag, i) => (
              <span key={i} className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
            {tags.length > 5 && (
              <span className="inline-block text-xs px-2 py-1 text-gray-500">
                +{tags.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
} 