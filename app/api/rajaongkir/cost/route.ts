import { NextResponse } from 'next/server';

const API_KEY = process.env.RAJAONGKIR_API_KEY || process.env.KOMERCE_API_KEY || '';
const BASE_URL = 'https://rajaongkir.komerce.id/api/v1';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { originCityId, destinationCityId, weightInGrams, courier } = body;

    if (!API_KEY) {
      return NextResponse.json({ success: false, message: "API Key logistik belum diatur di server." }, { status: 500 });
    }

    if (!originCityId || !destinationCityId || !weightInGrams || !courier) {
      return NextResponse.json({ success: false, message: "Parameter origin, destination, weight, dan courier wajib diisi." }, { status: 400 });
    }

    const response = await fetch(`${BASE_URL}/calculate/domestic-cost`, {
      method: 'POST',
      headers: {
        'key': API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        origin: originCityId, destination: destinationCityId, weight: weightInGrams.toString(), courier: courier.toLowerCase()
      }).toString()
    });

    const data = await response.json();

    if (!data.success || !data.data || data.data.length === 0) {
      console.warn(`[Komerce API] Kurir ${courier} tidak tersedia untuk rute ini.`, data);
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    const costsArray = data.data[0]?.costs || [];

    const formattedOptions = costsArray.map((costItem: any) => ({
      service: costItem.service,
      description: costItem.description,
      cost: costItem.cost[0]?.value || 0,
      etd: costItem.cost[0]?.etd || '-', name: data.data[0]?.name || courier.toUpperCase()
    }));

    return NextResponse.json({ success: true, data: formattedOptions }, { status: 200 });

  } catch (error: any) {
    console.error("RAJAONGKIR/KOMERCE COST ERROR:", error);
    return NextResponse.json({ success: false, message: error.message || "Gagal menghitung ongkos kirim." }, { status: 500 });
  }
}