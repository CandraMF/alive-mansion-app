import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Ambil pengaturan
export async function GET() {
  try {
    let settings = await prisma.storeSetting.findUnique({
      where: { id: 'default' }
    });

    if (!settings) {
      settings = await prisma.storeSetting.create({
        data: { id: 'default' }
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Gagal memuat pengaturan' }, { status: 500 });
  }
}

// PUT: Simpan pengaturan
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      storeName, whatsappNumber, originCityId, originCityName,
      activeCouriers, isMaintenance, taxRate
    } = body;

    const updatedSettings = await prisma.storeSetting.upsert({
      where: { id: 'default' },
      update: {
        storeName, whatsappNumber, originCityId, originCityName,
        activeCouriers, isMaintenance, taxRate
      },
      create: {
        id: 'default',
        storeName, whatsappNumber, originCityId, originCityName,
        activeCouriers, isMaintenance, taxRate
      }
    });

    return NextResponse.json({ success: true, data: updatedSettings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Gagal menyimpan pengaturan' }, { status: 500 });
  }
}