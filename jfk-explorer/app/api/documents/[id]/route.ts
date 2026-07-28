import { NextResponse } from 'next/server';
import { getDocumentById, getRelatedDocuments } from '@/app/lib/utils/search';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const doc = await getDocumentById(id);
  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  const related = await getRelatedDocuments(id, 5);
  return NextResponse.json({ document: doc, related });
}
