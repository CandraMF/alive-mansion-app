import { NextResponse } from 'next/server';

// Pastikan API Key Komerce Anda sudah terpasang di file .env
const API_KEY = process.env.RAJAONGKIR_API_KEY || process.env.KOMERCE_API_KEY || '';
const BASE_URL = 'https://rajaongkir.komerce.id/api/v1';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id'); // Ini bisa ID Provinsi, ID Kota, atau ID Kecamatan

  if (!API_KEY) {
    return NextResponse.json({ success: false, message: "API Key logistik belum diatur di server." }, { status: 500 });
  }

  let endpoint = '';

  // Menentukan Endpoint Komerce berdasarkan hirarki yang diminta
  switch (type) {
    case 'province':
      endpoint = '/destination/domestic-province';
      break;
    case 'city':
      if (!id) return NextResponse.json({ success: false, message: "ID Provinsi dibutuhkan" }, { status: 400 });
      endpoint = `/destination/domestic-city?province=${id}`;
      break;
    case 'district':
      if (!id) return NextResponse.json({ success: false, message: "ID Kota dibutuhkan" }, { status: 400 });
      // Catatan: Di RajaOngkir, 'subdistrict' adalah sebutan untuk Kecamatan (District)
      endpoint = `/destination/domestic-subdistrict?city=${id}`; 
      break;
    case 'subdistrict':
      if (!id) return NextResponse.json({ success: false, message: "ID Kecamatan dibutuhkan" }, { status: 400 });
      // Endpoint kelurahan/desa/destination Komerce
      endpoint = `/destination/domestic-destination?subdistrict=${id}`; 
      break;
    default:
      return NextResponse.json({ success: false, message: "Tipe hirarki tidak valid" }, { status: 400 });
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!data || !data.data) {
      throw new Error("Format respons API Logistik tidak valid.");
    }

    let formattedData = [];

    // Komerce mengembalikan properti yang berbeda-beda untuk tiap level.
    // Kita standarisasi menjadi format { id, name } agar mudah dibaca oleh frontend kita (AddressSection.tsx)
    if (type === 'province') {
      formattedData = data.data.map((item: any) => ({ 
        id: item.province_id, 
        name: item.province 
      }));
    } else if (type === 'city') {
      formattedData = data.data.map((item: any) => ({ 
        id: item.city_id, 
        name: `${item.type} ${item.city_name}` // Gabungkan "Kota" atau "Kabupaten" dengan namanya
      }));
    } else if (type === 'district') {
      formattedData = data.data.map((item: any) => ({ 
        id: item.subdistrict_id, 
        name: item.subdistrict_name 
      }));
    } else if (type === 'subdistrict') {
      formattedData = data.data.map((item: any) => ({ 
        id: item.id || item.destination_id, 
        name: item.name || item.destination_name || "Desa/Kelurahan" 
      }));
    }

    return NextResponse.json({ success: true, data: formattedData }, { status: 200 });

  } catch (error: any) {
    console.error("RAJAONGKIR/KOMERCE HIERARCHY ERROR:", error);
    return NextResponse.json({ success: false, message: error.message || "Gagal menghubungi server logistik." }, { status: 500 });
  }
}