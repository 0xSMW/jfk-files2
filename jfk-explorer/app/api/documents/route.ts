import { NextResponse } from 'next/server';
import { searchDocuments } from '@/app/lib/utils/search';
import { DocumentSearchParams } from '@/app/lib/models/document';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get('query') || undefined;
  const documentType = searchParams.get('documentType') || undefined;
  const tags = searchParams.get('tags')?.split(',').filter(Boolean);
  const dateFrom = searchParams.get('dateFrom') || undefined;
  const dateTo = searchParams.get('dateTo') || undefined;
  const sortBy = (searchParams.get('sortBy') as DocumentSearchParams['sortBy']) || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  const result = await searchDocuments({
    query,
    documentType,
    tags,
    dateFrom,
    dateTo,
    sortBy,
    page,
    limit
  });

  return NextResponse.json(result);
}
