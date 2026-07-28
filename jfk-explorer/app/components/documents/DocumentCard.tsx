import Link from 'next/link';
import { Document } from '@/app/lib/models/document';
import { formatDocDate, isKnownDate } from '@/app/lib/utils/date';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

  const formattedDate = formatDocDate(date);

  return (
    <Link href={`/documents/${id}`} className="block h-full">
      <Card className="p-4 h-full hover:bg-muted/50">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-base font-semibold leading-tight line-clamp-2">
            {title || 'Untitled Document'}
          </h3>

          {!isCompact && (
            <Badge variant="outline" className="shrink-0 font-normal text-muted-foreground">
              {document_type || 'Document'}
            </Badge>
          )}
        </div>

        <div className="mt-1 flex items-center text-sm gap-3">
          <span className={isKnownDate(date) ? 'text-muted-foreground' : 'text-muted-foreground/60'}>
            {formattedDate}
          </span>
          {origin_agency && !isCompact && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span className="text-muted-foreground">{origin_agency}</span>
            </>
          )}
        </div>

        {displaySummary && (
          <p className={`mt-3 text-sm text-muted-foreground ${isCompact ? 'line-clamp-2' : 'line-clamp-3'}`}>
            {displaySummary}
          </p>
        )}

        {tags && tags.length > 0 && !isCompact && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tags.slice(0, 5).map((tag, i) => (
              <Badge key={i} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
            {tags.length > 5 && (
              <span className="text-xs px-1 py-0.5 text-muted-foreground">
                +{tags.length - 5} more
              </span>
            )}
          </div>
        )}
      </Card>
    </Link>
  );
}
