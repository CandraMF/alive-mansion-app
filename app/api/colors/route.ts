// app/api/colors/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Pastikan path ini sesuai dengan letak prisma client Anda

// Mengambil semua data warna (GET)
export async function GET() {
  try {
    const colors = await prisma.color.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(colors);
  } catch (error) {
    console.error("GET Colors Error:", error);
    return NextResponse.json({ error: "Failed to fetch colors" }, { status: 500 });
  }
}

// Menyimpan warna baru (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, hexCodes } = body;

    if (!name || !hexCodes || hexCodes.length === 0) {
      return NextResponse.json({ error: "Name and at least one Hex Code are required" }, { status: 400 });
    }

    const newColor = await prisma.color.create({
      data: {
        name,
        hexCodes,
      }
    });

    return NextResponse.json(newColor, { status: 201 });
  } catch (error) {
    console.error("POST Color Error:", error);
    return NextResponse.json({ error: "Failed to create color" }, { status: 500 });
  }
}