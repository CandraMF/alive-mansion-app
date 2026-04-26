'use server';

import { prisma } from '@/lib/prisma';
import { withAuthAction } from '@/lib/safe-action';

// 1. Ambil data keranjang
export const getCartAction = withAuthAction(async (userId) => {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      variant: {
        include: {
          product: {
            include: {
              images: true
            }
          },
          size: true,
          color: true
        }
      }
    }
  });

  return cartItems.map(item => ({
    id: item.variantId,
    name: item.variant.product.name,
    price: item.variant.price,
    image: item.variant.product.images[0]?.url || '',
    size: item.variant.size.name,
    color: item.variant.color.name,
    quantity: item.quantity,
    weight: item.variant.product.weight || 500,
  }));
});

// 2. Tambah item ke keranjang
export const addToCartAction = withAuthAction(async (userId, variantId: string, quantity: number = 1) => {
  const existing = await prisma.cartItem.findUnique({
    where: { userId_variantId: { userId, variantId } }
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity }
    });
  } else {
    await prisma.cartItem.create({
      data: { userId, variantId, quantity }
    });
  }
  return { success: true };
});

// 3. Update kuantitas item
export const updateCartItemAction = withAuthAction(async (userId, variantId: string, quantity: number) => {
  await prisma.cartItem.update({
    where: { userId_variantId: { userId, variantId } },
    data: { quantity }
  });
  return { success: true };
});

// 4. Hapus item dari keranjang
export const removeFromCartAction = withAuthAction(async (userId, variantId: string) => {
  await prisma.cartItem.delete({
    where: { userId_variantId: { userId, variantId } }
  });
  return { success: true };
});

// 5. Kosongkan semua isi keranjang
export const clearCartAction = withAuthAction(async (userId) => {
  await prisma.cartItem.deleteMany({
    where: { userId }
  });
  return { success: true };
});