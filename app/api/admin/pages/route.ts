import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Ambil semua daftar halaman CMS
export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        isPublished: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, data: pages });
  } catch (error) {
    console.error('Error fetching all pages:', error);
    return NextResponse.json({ error: 'Gagal memuat daftar halaman' }, { status: 500 });
  }
}

// POST: Buat halaman CMS baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title dan Slug wajib diisi' }, { status: 400 });
    }

    // Cek apakah slug sudah terpakai
    const existingPage = await prisma.page.findUnique({
      where: { slug }
    });

    if (existingPage) {
      return NextResponse.json({ error: 'Slug sudah digunakan oleh halaman lain' }, { status: 400 });
    }

    // Buat halaman baru dengan struktur kosong
    const newPage = await prisma.page.create({
      data: {
        title,
        slug,
        metaTitle: title,
      }
    });

    return NextResponse.json({ success: true, data: newPage }, { status: 201 });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json({ error: 'Gagal membuat halaman baru' }, { status: 500 });
  }
}