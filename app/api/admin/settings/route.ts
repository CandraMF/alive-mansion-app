import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Struktur default untuk menu navigasi pertama kali
const DEFAULT_SETTINGS = {
  header: {
    navigation: [
      { id: "nav-1", label: "Home", type: "page", url: "/" }
    ]
  }
};

// GET: Ambil pengaturan
export async function GET() {
  try {
    let settings = await prisma.storeSettings.findUnique({
      where: { id: 'global' }
    });

    // Jika database masih kosong, buat otomatis dengan data default
    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          id: 'global',
          content: DEFAULT_SETTINGS
        }
      });
    }

    return NextResponse.json({ success: true, data: settings.content });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Gagal memuat pengaturan' }, { status: 500 });
  }
}

// PUT: Simpan pengaturan dari Drag & Drop
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const updatedSettings = await prisma.storeSettings.upsert({
      where: { id: 'global' },
      update: { content: body },
      create: { id: 'global', content: body }
    });

    return NextResponse.json({ success: true, data: updatedSettings.content });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Gagal menyimpan pengaturan' }, { status: 500 });
  }
}