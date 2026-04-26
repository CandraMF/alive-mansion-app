'use server';

import { prisma } from '@/lib/prisma';
import { withAuthAction } from '@/lib/safe-action';
import { Xendit } from 'xendit-node';

const xendit = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY || '' });

export const createOrderAction = withAuthAction(async (userId, orderData: any) => {
  try {
    // Kita butuh email user untuk dikirimkan ke payload Xendit Invoice
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.email) {
      return { success: false, error: 'User email not found.' };
    }

    // ==========================================
    // 🚀 SAFETY CHECK & GET PRODUCT ID
    // ==========================================
    const variantIds = orderData.items.map((item: any) => item.variantId).filter(Boolean);

    const existingVariants = await prisma.variant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true, productId: true }
    });

    if (existingVariants.length !== variantIds.length) {
      return {
        success: false,
        error: 'Some products in your cart are no longer available. Please refresh your cart.'
      };
    }

    // 1. Save Order to Database
    const newOrder = await prisma.order.create({
      data: {
        userId: userId,
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
            const matchedVariant = existingVariants.find(v => v.id === item.variantId);
            return {
              productId: item.productId || matchedVariant?.productId || null,
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

    // ==========================================
    // 🚀 VOUCHER DEDUCTION (RESERVE VOUCHER)
    // ==========================================
    if (orderData.voucherCode) {
      const promo = await prisma.promo.findUnique({ where: { code: orderData.voucherCode } });

      if (promo) {
        const userVoucher = await prisma.userVoucher.findFirst({
          where: {
            userId: userId,
            promoId: promo.id,
            status: 'AVAILABLE'
          }
        });

        if (userVoucher) {
          // 1. Mark user's voucher as USED
          await prisma.userVoucher.update({
            where: { id: userVoucher.id },
            data: { status: 'USED', usedAt: new Date() }
          });

          // 2. Increment global promo usage quota
          await prisma.promo.update({
            where: { id: promo.id },
            data: { quotaUsed: { increment: 1 } }
          });
        }
      }
    }

    // 2. Create Xendit Invoice
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

    // 3. Update Database with Payment URL
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
    return { success: false, error: error.message || 'Failed to create order.' };
  }
});