import { NextResponse } from 'next/server';
import { generateGraphData } from '@/app/lib/utils/graph-transformer';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const maxNodes = parseInt(searchParams.get('maxNodes') || '100', 10);
  const searchQuery = searchParams.get('searchQuery') || '';
  const documentTypes = searchParams.get('documentTypes')?.split(',').filter(Boolean) || [];
  const entityTypes = searchParams.get('entityTypes')?.split(',').filter(Boolean) || [];

  const data = await generateGraphData({
    maxNodes,
    searchQuery,
    documentTypes,
    entityTypes
  });

  return NextResponse.json(data);
}
