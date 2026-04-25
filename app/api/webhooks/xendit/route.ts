import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Token dari .env.local untuk memastikan ini benar-benar Xendit
const CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN || '';

export async function POST(request: Request) {
  try {
    // 1. Verifikasi Keamanan
    const reqToken = request.headers.get('x-callback-token');
    
    if (reqToken !== CALLBACK_TOKEN) {
      console.warn("🚨 Seseorang mencoba memalsukan Webhook Xendit!");
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // 2. Tangkap data yang dikirim Xendit
    const body = await request.json();
    console.log("📥 Webhook Xendit Masuk:", body.id, "Status:", body.status);

    // 3. Update Database berdasarkan Status Invoice
    if (body.status === 'PAID' || body.status === 'SETTLED') {
      
      await prisma.order.update({
        where: { xenditInvoiceId: body.id },
        data: {
          paymentStatus: 'PAID',
          paymentMethod: body.payment_method || 'XENDIT',
          // Otomatis ubah status pesanan agar Admin tahu pesanan ini siap diproses
          orderStatus: 'PROCESSING', 
        }
      });
      
      console.log(`✅ Pesanan dengan Invoice ${body.id} berhasil LUNAS!`);

    } else if (body.status === 'EXPIRED') {
      
      await prisma.order.update({
        where: { xenditInvoiceId: body.id },
        data: {
          paymentStatus: 'EXPIRED',
          orderStatus: 'CANCELLED', // Batalkan pesanan karena tidak dibayar
        }
      });
      
      console.log(`❌ Pesanan dengan Invoice ${body.id} KADALUARSA.`);
    }

    // Xendit mewajibkan kita membalas dengan status 200 agar mereka tahu kita sudah menerima pesannya
    return NextResponse.json({ success: true, message: 'Webhook Processed' }, { status: 200 });

  } catch (error: any) {
    console.error("💥 WEBHOOK ERROR:", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}