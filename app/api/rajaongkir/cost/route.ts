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

    // 🚀 UBAH FORMAT: Komerce meminta pemisah titik dua (:) bukan koma (,)
    const formattedCouriers = courier.split(',').map((c: string) => c.trim()).join(':');

    // 🚀 ENDPOINT BARU: /calculate/district/domestic-cost
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
        price: 'lowest' // 🚀 PARAMETER AJAIB DARI DOKUMENTASI
      }).toString()
    });

    const data = await response.json();

    if (!data.success || !data.data || data.data.length === 0) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 }); 
    }

    // Komerce mengembalikan array kurir: [{ code: 'jne', name: 'JNE', costs: [...] }, ...]
    // Kita ratakan (flatten) semua `costs` dari berbagai kurir menjadi satu array pilihan
    const allFormattedOptions: any[] = [];

    data.data.forEach((courierData: any) => {
      const courierName = courierData.name || courierData.code.toUpperCase();
      
      if (courierData.costs && courierData.costs.length > 0) {
        courierData.costs.forEach((costItem: any) => {
          allFormattedOptions.push({
            service: costItem.service,
            description: costItem.description,
            cost: costItem.cost[0]?.value || 0,
            etd: costItem.cost[0]?.etd || '-',
            name: courierName
          });
        });
      }
    });

    const sortedOptions = allFormattedOptions.sort((a, b) => a.cost - b.cost);

    return NextResponse.json({ success: true, data: sortedOptions }, { status: 200 });

  } catch (error: any) {
    console.error("RAJAONGKIR COST API ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to calculate shipping cost." }, { status: 500 });
  }
}