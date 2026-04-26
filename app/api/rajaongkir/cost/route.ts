import { NextResponse } from 'next/server';

const API_KEY = process.env.RAJAONGKIR_API_KEY || process.env.KOMERCE_API_KEY || '';
const BASE_URL = 'https://rajaongkir.komerce.id/api/v1';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { originCityId, destinationCityId, weightInGrams, courier } = body;

    if (!API_KEY) {
      return NextResponse.json({ success: false, message: "Logistics API Key not found." }, { status: 500 });
    }

    if (!originCityId || !destinationCityId || !weightInGrams || !courier) {
      return NextResponse.json({ success: false, message: "Missing required parameters." }, { status: 400 });
    }

    const formattedCouriers = courier.split(',').map((c: string) => c.trim()).join(':');

    const response = await fetch(`${BASE_URL}/calculate/district/domestic-cost`, {
      method: 'POST',
      headers: {
        'key': API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        origin: originCityId,
        destination: destinationCityId,
        weight: weightInGrams.toString(),
        courier: formattedCouriers,
        price: 'lowest' 
      }).toString()
    });

    const data = await response.json();

    // 🚀 FIX: Menggunakan data.meta.status atau data.meta.code sesuai format Komerce
    if (data.meta?.status !== 'success' || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 }); 
    }

    // Mapping format baru sesuai response Komerce yang sudah flat
    const allFormattedOptions = data.data.map((item: any) => ({
      service: item.service,
      description: item.description,
      cost: item.cost,
      etd: item.etd || '-',
      name: item.name || item.code.toUpperCase()
    }));

    // Urutkan dari yang termurah
    const sortedOptions = allFormattedOptions.sort((a: any, b: any) => a.cost - b.cost);

    return NextResponse.json({ success: true, data: sortedOptions }, { status: 200 });

  } catch (error: any) {
    console.error("RAJAONGKIR COST API ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to calculate shipping cost." }, { status: 500 });
  }
}