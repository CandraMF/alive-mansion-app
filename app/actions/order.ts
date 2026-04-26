'use server';

import { prisma } from '@/lib/prisma';
import { withAuthAction } from '@/lib/safe-action';
import { Xendit } from 'xendit-node';

const xendit = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY || '' });

export const createOrderAction = withAuthAction(async (userId, orderData: any) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.email) return { success: false, error: 'User email not found.' };

    const variantIds = orderData.items.map((item: any) => item.variantId).filter(Boolean);

    // =========================================================================
    // 🚀 TRANSACTION START: Guarantee Data Consistency (Stock, Price, Voucher)
    // =========================================================================
    const orderResult = await prisma.$transaction(async (tx) => {
      
      // 1. FETCH ORIGINAL VARIANTS FROM DB (Anti-Hacker Price Manipulation)
      const existingVariants = await tx.variant.findMany({
        where: { id: { in: variantIds } },
        include: { product: { select: { name: true } } }
      });

      if (existingVariants.length !== variantIds.length) {
        throw new Error('Some products in your cart are no longer available. Please refresh your cart.');
      }

      let calculatedSubtotal = 0;
      const validatedItems = [];

      // 2. STOCK VALIDATION & RE-CALCULATE PRICE
      for (const item of orderData.items) {
        const dbVariant = existingVariants.find(v => v.id === item.variantId);
        
        if (!dbVariant) throw new Error('Product not found in database.');
        
        // 🚀 STOCK PROTECTION: Check if stock is sufficient
        if (dbVariant.stock < item.quantity) {
          throw new Error(`Stock for product ${dbVariant.product.name} is not enough. Only ${dbVariant.stock} items left.`);           
        }

        // 🚀 SERVER CALCULATION: Use DB price, ignore frontend price
        calculatedSubtotal += (dbVariant.price * item.quantity);

        validatedItems.push({
          productId: dbVariant.productId,
          variantId: dbVariant.id,
          name: dbVariant.product.name,
          sku: dbVariant.sku || 'SKU-000',
          price: dbVariant.price, // Original price from DB
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          imageUrl: item.image
        });
      }

      // 3. CALCULATE TOTAL AMOUNT (Real Subtotal + Shipping - Discount + Tax)
      const finalTotalAmount = calculatedSubtotal 
        + Number(orderData.shippingCost || 0) 
        + Number(orderData.taxAmount || 0) 
        - Number(orderData.discountAmount || 0);

      // 4. DEDUCT VOUCHER (Anti Race-Condition)
      if (orderData.voucherCode) {
        const promo = await tx.promo.findUnique({ where: { code: orderData.voucherCode } });
        
        if (promo) {
          // 🚀 ATOMIC UPDATE: Only update if quota is available
          const updatedPromo = await tx.promo.updateMany({
            where: {
              id: promo.id,
              OR: [
                { quotaTotal: null },
                { quotaUsed: { lt: promo.quotaTotal || 999999 } }
              ]
            },
            data: { quotaUsed: { increment: 1 } }
          });

          if (updatedPromo.count === 0) {
            throw new Error('Sorry, the voucher quota has been fully used. Please choose another voucher or proceed without one.');
          }

          const userVoucher = await tx.userVoucher.findFirst({
            where: { userId: userId, promoId: promo.id, status: 'AVAILABLE' }
          });
          
          if (userVoucher) {
            await tx.userVoucher.update({
              where: { id: userVoucher.id },
              data: { status: 'USED', usedAt: new Date() }
            });
          }
        }
      }

      // 5. DEDUCT VARIANT STOCK (Decrement)
      for (const item of validatedItems) {
        await tx.variant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // 6. SAVE ORDER TO DATABASE
      return await tx.order.create({
        data: {
          userId: userId,
          addressId: orderData.addressId,
          subtotal: calculatedSubtotal, 
          shippingCost: orderData.shippingCost,
          discountAmount: orderData.discountAmount,
          taxAmount: orderData.taxAmount,
          totalAmount: finalTotalAmount, 
          courier: orderData.courier,
          courierService: orderData.courierService,
          shippingAddress: orderData.shippingAddress,
          voucherCode: orderData.voucherCode,
          items: { create: validatedItems }
        },
        include: { items: true } // 🚀 Include items so they can be accessed outside transaction
      });
    });
    // =========================================================================
    // 🚀 TRANSACTION END
    // =========================================================================

    // 7. CREATE XENDIT INVOICE OUTSIDE TRANSACTION
    const invoicePayload = {
      externalId: orderResult.id, 
      amount: orderResult.totalAmount,
      payerEmail: user.email,
      description: `Payment for Order #${orderResult.id.slice(-6).toUpperCase()} at Alive Mansion`,
      customer: {
        givenNames: orderData.recipientName,
        email: user.email,
        mobileNumber: orderData.phone,
      },
      successRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderResult.id}`,
      failureRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      currency: 'IDR',
      // 🚀 Use orderResult.items validated by backend
      items: orderResult.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price, // Original price retrieved from the inserted DB order items
        category: 'Fashion'
      }))
    };

    const response = await xendit.Invoice.createInvoice({ data: invoicePayload });

    // 8. UPDATE PAYMENT URL
    await prisma.order.update({
      where: { id: orderResult.id },
      data: {
        xenditInvoiceId: response.id,
        paymentUrl: response.invoiceUrl
      }
    });

    return { success: true, paymentUrl: response.invoiceUrl };

  } catch (error: any) {
    console.error("Order Creation Error:", error);
    return { success: false, error: error.message || 'Failed to process order.' };
  }
});