// app/api/rajaongkir/cost/route.ts
import { NextResponse } from 'next/server';
import { calculateShippingCost } from '@/lib/rajaongkir';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { originCityId, destinationCityId, weightInGrams, courier } = body;

    // Validasi input
    if (!originCityId || !destinationCityId || !weightInGrams || !courier) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters (origin, destination, weight, courier)" },
        { status: 400 }
      );
    }

    // Panggil fungsi helper RajaOngkir
    const costResult = await calculateShippingCost(
      originCityId,
      destinationCityId,
      weightInGrams,
      courier as 'jne' | 'pos' | 'tiki'
    );

    if (!costResult) {
      return NextResponse.json(
        { success: false, error: "Failed to calculate shipping cost from RajaOngkir." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: costResult });

  } catch (error: any) {
    console.error("Cost API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}