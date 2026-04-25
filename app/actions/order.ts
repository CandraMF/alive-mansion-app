'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Xendit } from 'xendit-node';

const xendit = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY || '' });

export async function createOrderAction(orderData: any) {

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { success: false, error: 'Anda harus login untuk melakukan pesanan.' };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return { success: false, error: 'User tidak ditemukan.' };

    // ==========================================
    // 🚀 SAFETY CHECK & GET PRODUCT ID
    // Kita cek berdasarkan variantId yang dikirim dari Cart
    // ==========================================
    const variantIds = orderData.items.map((item: any) => item.variantId).filter(Boolean);

    const existingVariants = await prisma.variant.findMany({
      where: { id: { in: variantIds } },
      select: {
        id: true,
        productId: true // 🚀 Ambil productId aslinya dari database!
      }
    });

    if (existingVariants.length !== variantIds.length) {
      return {
        success: false,
        error: 'Beberapa produk di keranjang Anda sudah tidak tersedia di toko. Mohon perbarui keranjang Anda.'
      };
    }

    // 1. Simpan Order ke Database
    const newOrder = await prisma.order.create({
      data: {
        userId: user.id,
        addressId: orderData.addressId,
        subtotal: orderData.subtotal,
        shippingCost: orderData.shippingCost,
        discountAmount: orderData.discountAmount,
        taxAmount: orderData.taxAmount,
        totalAmount: orderData.totalAmount,
        courier: orderData.courier,
        courierService: orderData.courierService,
        shippingAddress: orderData.shippingAddress,
        voucherCode: orderData.voucherCode,

        items: {
          create: orderData.items.map((item: any) => {
            // Cocokkan variantId untuk mendapatkan productId yang valid
            const matchedVariant = existingVariants.find(v => v.id === item.variantId);

            return {
              productId: item.productId || matchedVariant?.productId || null, // 🚀 Super Aman!
              variantId: item.variantId,
              name: item.name,
              sku: item.sku || 'SKU-000',
              price: item.price,
              quantity: item.quantity,
              color: item.color,
              size: item.size,
              imageUrl: item.image
            };
          })
        }
      }
    });

    // 2. Buat Invoice di Xendit
    const invoicePayload = {
      externalId: newOrder.id,
      amount: newOrder.totalAmount,
      payerEmail: user.email,
      description: `Payment for Order #${newOrder.id.slice(-6).toUpperCase()} at Alive Mansion`,
      customer: {
        givenNames: orderData.recipientName,
        email: user.email,
        mobileNumber: orderData.phone,
      },
      successRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${newOrder.id}`,
      failureRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      currency: 'IDR',
      items: orderData.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        category: 'Fashion'
      }))
    };

    const response = await xendit.Invoice.createInvoice({ data: invoicePayload });

    // 3. Update Database kita dengan URL Pembayaran
    await prisma.order.update({
      where: { id: newOrder.id },
      data: {
        xenditInvoiceId: response.id,
        paymentUrl: response.invoiceUrl
      }
    });

    return { success: true, paymentUrl: response.invoiceUrl };

  } catch (error: any) {
    console.error("Order Creation Error:", error);
    return { success: false, error: error.message || 'Gagal membuat pesanan.' };
  }
}