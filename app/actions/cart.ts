'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const getUser = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({ where: { email: session.user.email } });
};

export async function getCartAction() {
  const user = await getUser();
  if (!user) return [];

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.id },
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
}

export async function addToCartAction(variantId: string, quantity: number = 1) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const existing = await prisma.cartItem.findUnique({
    where: { userId_variantId: { userId: user.id, variantId } }
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity }
    });
  } else {
    await prisma.cartItem.create({
      data: { userId: user.id, variantId, quantity }
    });
  }
  return { success: true };
}

export async function updateCartItemAction(variantId: string, quantity: number) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.cartItem.update({
    where: { userId_variantId: { userId: user.id, variantId } },
    data: { quantity }
  });
  return { success: true };
}

export async function removeFromCartAction(variantId: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.cartItem.delete({
    where: { userId_variantId: { userId: user.id, variantId } }
  });
  return { success: true };
}

export async function clearCartAction() {
  const user = await getUser();
  if (!user) return { success: false };

  await prisma.cartItem.deleteMany({
    where: { userId: user.id }
  });
  return { success: true };
}