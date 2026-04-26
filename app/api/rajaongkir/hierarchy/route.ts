import { NextResponse } from 'next/server';

const API_KEY = process.env.RAJAONGKIR_API_KEY || process.env.KOMERCE_API_KEY || '';
const BASE_URL = 'https://rajaongkir.komerce.id/api/v1';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  if (!API_KEY) {
    return NextResponse.json({ success: false, message: "Logistics API Key not found." }, { status: 500 });
  }

  let endpoint = '';

  switch (type) {
    case 'province':
      endpoint = '/destination/province';
      break;
    case 'city':
      if (!id) return NextResponse.json({ success: false, message: "Province ID is required" }, { status: 400 });
      endpoint = `/destination/city/${id}`;
      break;
    case 'district':
      if (!id) return NextResponse.json({ success: false, message: "City ID is required" }, { status: 400 });
      endpoint = `/destination/district/${id}`;
      break;
    case 'subdistrict':
      if (!id) return NextResponse.json({ success: false, message: "District ID is required" }, { status: 400 });
      endpoint = `/destination/sub-district/${id}`;
      break;
    default:
      return NextResponse.json({ success: false, message: "Invalid hierarchy type" }, { status: 400 });
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const rawText = await response.text();

    if (!response.ok) {
      console.error(`[Komerce API Error] Status: ${response.status}, Endpoint: ${endpoint}`);
      return NextResponse.json({ success: false, message: `API Error: ${response.status}` }, { status: response.status });
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      return NextResponse.json({ success: false, message: "Invalid API response." }, { status: 500 });
    }

    const results = data.data || [];
    
    // 🚀 MAPPER: Tambahkan zip_code / postal_code
    const formattedData = results.map((item: any) => ({ 
      id: String(item.id || item.province_id || item.city_id || item.subdistrict_id || ''), 
      name: item.name || item.province || item.city_name || item.subdistrict_name || 'Unknown Location',
      postalCode: String(item.zip_code || item.postal_code || '')
    }));

    return NextResponse.json({ success: true, data: formattedData }, { status: 200 });

  } catch (error: any) {
    console.error("RAJAONGKIR HIERARCHY FETCH ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to connect to logistics server." }, { status: 500 });
  }
}