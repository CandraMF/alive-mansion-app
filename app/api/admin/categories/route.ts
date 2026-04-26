import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Menggunakan kurung kurawal sesuai style Anda 😉

export async function GET() {
  try {
    // Mengambil semua kategori beserta info parent-nya
    const categories = await prisma.category.findMany({
      include: {
        parent: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, parentId } = body;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    // Auto-generate slug (Ubah ke huruf kecil, ganti spasi jadi strip)
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Cek apakah slug sudah ada
    const existingCategory = await prisma.category.findUnique({ where: { slug } });
    if (existingCategory) {
      return NextResponse.json({ error: "Category with this name/slug already exists" }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
        parentId: parentId || null, // Jika string kosong, jadikan null
      }
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}