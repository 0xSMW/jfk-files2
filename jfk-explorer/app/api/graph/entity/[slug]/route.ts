import { NextResponse } from 'next/server';
import { generateEntityCentricGraph } from '@/app/lib/utils/graph-transformer';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const data = await generateEntityCentricGraph(slug);
  return NextResponse.json(data);
}
