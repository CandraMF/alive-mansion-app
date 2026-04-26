import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. GET: Server-Side Pagination, Filtering, & Searching
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'ALL';
    const status = searchParams.get('status') || 'ALL';
    const sort = searchParams.get('sort') || 'NEWEST';

    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (status !== 'ALL') {
      where.status = status;
    }

    if (category !== 'ALL') {
      const allCategories = await prisma.category.findMany();
      const getChildCategoryIds = (parentId: string): string[] => {
        const children = allCategories.filter(c => c.parentId === parentId);
        let ids = children.map(c => c.id);
        children.forEach(c => { ids = [...ids, ...getChildCategoryIds(c.id)]; });
        return ids;
      };

      const relatedCategoryIds = [category, ...getChildCategoryIds(category)];
      where.categoryId = { in: relatedCategoryIds };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'OLDEST') orderBy = { createdAt: 'asc' };
    if (sort === 'NAME_ASC') orderBy = { name: 'asc' };
    if (sort === 'NAME_DESC') orderBy = { name: 'desc' };

    const skip = (page - 1) * limit;

    const [products, totalItems] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { include: { parent: true } },
          images: { orderBy: { position: 'asc' } },
          variants: {
            where: { isArchived: false }, // 🚀 FILTER: Jangan ambil varian yang sudah di-archive
            include: {
              color: true,
              size: true
            }
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where })
    ]);

    return NextResponse.json({
      data: products,
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products.' }, { status: 500 });
  }
}

// 2. POST: CREATE PRODUCT
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      description,
      status,
      categoryId,
      weight,
      variants, images
    } = body;

    if (!name || !variants || variants.length === 0 || !images || images.length === 0) {
      return NextResponse.json(
        { error: 'Name, variants (stock & price), and images are required.' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        weight: parseInt(weight, 10) || 500,
        status: status || 'PUBLISHED',
        categoryId: categoryId || null,

        variants: {
          create: variants.map((v: any) => {
            const colorCode = v.colorId ? v.colorId.slice(-5).toUpperCase() : 'NOCL';
            const sizeCode = v.sizeId ? v.sizeId.slice(-5).toUpperCase() : 'NOSZ';

            return {
              colorId: v.colorId,
              sizeId: v.sizeId,
              stock: parseInt(v.stock, 10) || 0,
              price: parseInt(v.price, 10) || 0,
              isMain: v.isMain || false,
              sku: `${name.replace(/\s+/g, '-').toUpperCase()}-${colorCode}-${sizeCode}`
            };
          })
        },

        images: {
          create: images.map((img: any) => ({
            url: img.url,
            colorId: img.colorId || null,
            category: img.category || "MAIN",
            position: img.position || 0
          }))
        }
      },
      include: {
        variants: true,
        images: true
      }
    });

    return NextResponse.json({ success: true, data: product, message: 'Product created successfully.' }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product. Please check the server logs.' },
      { status: 500 }
    );
  }
}