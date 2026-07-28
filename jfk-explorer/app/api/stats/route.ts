import { NextResponse } from 'next/server';
import { getDataStatistics } from '@/app/lib/utils/data-loader';

export async function GET() {
  const stats = await getDataStatistics();
  return NextResponse.json(stats);
}
