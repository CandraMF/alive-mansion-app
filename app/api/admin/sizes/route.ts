import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const sizes = await prisma.size.findMany({ orderBy: { sortOrder: 'asc' } });
  return NextResponse.json(sizes);
}

export async function POST(request: Request) {
  const { name, sortOrder } = await request.json();
  const newSize = await prisma.size.create({
    data: { name, sortOrder: parseInt(sortOrder) || 0 }
  });
  return NextResponse.json(newSize);
}