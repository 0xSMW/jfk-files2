import { NextResponse } from 'next/server';
import { loadEntityBySlug, loadDocumentsByIds } from '@/app/lib/utils/data-loader';
import { Document } from '@/app/lib/models/document';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const entity = await loadEntityBySlug(slug);
  if (!entity) {
    return NextResponse.json({ error: 'Entity not found' }, { status: 404 });
  }

  let documents: Document[] = [];
  if (entity.document_ids && entity.document_ids.length > 0) {
    documents = await loadDocumentsByIds(entity.document_ids);
  }

  return NextResponse.json({ entity, documents });
}
