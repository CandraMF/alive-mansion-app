// app/api/rajaongkir/locations/route.ts
import { NextResponse } from 'next/server';
import { getProvinces, getCities } from '@/lib/rajaongkir';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provinceId = searchParams.get('province');

  try {
    // Jika ada parameter 'province', kembalikan daftar kota di provinsi tersebut
    if (provinceId) {
      const cities = await getCities(provinceId);
      return NextResponse.json({ success: true, data: cities });
    } 
    
    // Jika tidak ada parameter, kembalikan daftar semua provinsi
    const provinces = await getProvinces();
    return NextResponse.json({ success: true, data: provinces });

  } catch (error: any) {
    console.error("Location API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}