import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { destinationCityId, weight } = body;

        // TODO: Ganti URL ini dengan Endpoint API kurir asli (misal: RajaOngkir/Biteship)
        // Simulasi hitung ongkir (Flat rate Rp 20.000 untuk simulasi ini)
        const simulatedShippingCost = 20000;

        return NextResponse.json({
            success: true,
            cost: simulatedShippingCost,
            courier: 'JNE Reguler'
        });
    } catch (error) {
        return NextResponse.json({ error: 'Gagal menghitung ongkir' }, { status: 500 });
    }
}