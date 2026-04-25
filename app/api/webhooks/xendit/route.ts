import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN || '';

export async function POST(request: Request) {
  try {
    const reqToken = request.headers.get('x-callback-token');
    
    if (reqToken !== CALLBACK_TOKEN) {
      console.warn("🚨 Unauthorized Xendit Webhook Attempt!");
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log("📥 Incoming Xendit Webhook:", body.id, "Status:", body.status);

    if (body.status === 'PAID' || body.status === 'SETTLED') {
      
      await prisma.order.update({
        where: { xenditInvoiceId: body.id },
        data: {
          paymentStatus: 'PAID',
          paymentMethod: body.payment_method || 'XENDIT',
          orderStatus: 'PROCESSING', 
        }
      });
      console.log(`✅ Order with Invoice ${body.id} is now PAID!`);

    } else if (body.status === 'EXPIRED') {
      
      // Get the order details to check if there is a voucher to refund
      const order = await prisma.order.findUnique({ 
        where: { xenditInvoiceId: body.id } 
      });

      if (order) {
        // ==========================================
        // 🚀 VOUCHER REFUND (REVERT TO AVAILABLE)
        // ==========================================
        if (order.voucherCode) {
          const promo = await prisma.promo.findUnique({ where: { code: order.voucherCode } });
          
          if (promo) {
            // Find the exact voucher that was marked as USED for this user
            const userVoucher = await prisma.userVoucher.findFirst({
              where: { 
                userId: order.userId, 
                promoId: promo.id, 
                status: 'USED' 
              },
              orderBy: { usedAt: 'desc' } // Get the most recently used
            });
            
            if (userVoucher) {
              // 1. Revert user's voucher to AVAILABLE
              await prisma.userVoucher.update({
                where: { id: userVoucher.id },
                data: { status: 'AVAILABLE', usedAt: null }
              });
              
              // 2. Decrement global promo usage quota
              await prisma.promo.update({
                where: { id: promo.id },
                data: { quotaUsed: { decrement: 1 } }
              });
              
              console.log(`🎟️ Voucher ${order.voucherCode} has been refunded to User ${order.userId}.`);
            }
          }
        }

        // Update the order status to CANCELLED
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'EXPIRED',
            orderStatus: 'CANCELLED',
          }
        });
      }
      
      console.log(`❌ Order with Invoice ${body.id} has EXPIRED.`);
    }

    return NextResponse.json({ success: true, message: 'Webhook Processed' }, { status: 200 });

  } catch (error: any) {
    console.error("💥 WEBHOOK ERROR:", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}