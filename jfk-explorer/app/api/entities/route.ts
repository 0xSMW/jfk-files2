import { NextResponse } from 'next/server';
import { searchEntities } from '@/app/lib/utils/search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get('query') || undefined;
  const type = searchParams.get('type') || undefined;
  const sortField = searchParams.get('sortField') || undefined;
  const sortDirection = (searchParams.get('sortDirection') as 'asc' | 'desc') || 'asc';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  const result = await searchEntities({
    query,
    type,
    sortField,
    sortDirection,
    page,
    limit
  });

  return NextResponse.json(result);
}
