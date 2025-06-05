import { prisma } from '@/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const metrics = await prisma.$metrics?.prometheus();
  return new NextResponse(metrics);
}
