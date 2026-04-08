import { NextResponse } from 'next/server';
import { Xendit } from 'xendit-node';

const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY!
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, customerName, email } = body;

    // Buat ID pesanan unik
    const externalId = `ORDER-${Date.now()}`;

    // Memanggil API Xendit untuk membuat Invoice
    const invoice = await xendit.Invoice.createInvoice({
      data: {
        externalId: externalId,
        amount: amount,
        payerEmail: email,
        description: `Pembayaran pesanan untuk ${customerName}`,
        // URL jika sukses bayar
        successRedirectUrl: 'http://localhost:3000/success', 
      }
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: invoice.invoiceUrl // Ini link yang akan dibuka pembeli
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal membuat pembayaran' }, { status: 500 });
  }
}