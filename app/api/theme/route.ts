// app/api/theme/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Mengambil pengaturan tema (GET)
export async function GET() {
  try {
    let settings = await prisma.themeSetting.findUnique({
      where: { key: 'global' },
    });

    // Jika belum ada di database, buat nilai default kosong
    if (!settings) {
      settings = await prisma.themeSetting.create({
        data: {
          key: 'global',
          navbar: {
            logoUrl: '/logo-black.png',
            links: [
              { label: 'HOME', url: '/' },
              { label: 'SHOP', url: '/shop' },
              { label: 'ABOUT', url: '/about' }
            ]
          },
          footer: {
            copyright: `Copyright © ${new Date().getFullYear()} ALIVE MANSION`,
          }
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching theme settings:", error);
    return NextResponse.json({ error: "Failed to fetch theme settings" }, { status: 500 });
  }
}

// Menyimpan pembaruan tema (POST/PUT)
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Pastikan kita selalu mengupdate record dengan key 'global'
    const updatedSettings = await prisma.themeSetting.upsert({
      where: { key: 'global' },
      update: {
        navbar: data.navbar,
        footer: data.footer,
        global: data.global
      },
      create: {
        key: 'global',
        navbar: data.navbar,
        footer: data.footer,
        global: data.global
      }
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Error saving theme settings:", error);
    return NextResponse.json({ error: "Failed to save theme settings" }, { status: 500 });
  }
}