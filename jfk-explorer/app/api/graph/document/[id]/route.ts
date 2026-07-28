import { NextResponse } from 'next/server';
import { generateDocumentCentricGraph } from '@/app/lib/utils/graph-transformer';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await generateDocumentCentricGraph(id);
  return NextResponse.json(data);
}
