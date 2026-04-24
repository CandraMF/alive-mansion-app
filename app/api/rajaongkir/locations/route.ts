// app/api/rajaongkir/locations/route.ts
import { NextResponse } from 'next/server';
import { searchDestination } from '@/lib/rajaongkir';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');

  if (!keyword || keyword.length < 3) {
    return NextResponse.json({ success: true, data: [] }); // Minimal 3 huruf untuk cari
  }

  try {
    const locations = await searchDestination(keyword);
    return NextResponse.json({ success: true, data: locations });
  } catch (error: any) {
    console.error("Location API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}