import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';


    if (!query) {
      return NextResponse.json([]);
    }

    const products = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        name: { contains: query, mode: 'insensitive' },
        variants: { some: { isArchived: false } }
      },
      take: 8,
      include: {
        images: { orderBy: { position: 'asc' }, take: 1 },
        variants: { where: { isArchived: false }, select: { price: true } }
      },
      orderBy: { createdAt: 'desc' }
    });


    const formattedProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      image: p.images[0]?.url || '/placeholder.png',

      price: Math.min(...p.variants.map(v => v.price))
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to search products" }, { status: 500 });
  }
}