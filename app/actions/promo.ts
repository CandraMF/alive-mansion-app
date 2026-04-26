'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { withAdminAction } from '@/lib/safe-action';

// 1. GET ALL PROMOS
export const getPromosAction = withAdminAction(async (adminId) => {
  return await prisma.promo.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { claimedVouchers: true }
      }
    }
  });
});

// 2. CREATE PROMO
export const createPromoAction = withAdminAction(async (adminId, data: any) => {
  try {
    const cleanCode = data.code.toUpperCase().replace(/\s+/g, '');

    const existingPromo = await prisma.promo.findUnique({
      where: { code: cleanCode }
    });

    if (existingPromo) {
      return { error: 'Promo code already exists! Please use a different code.' };
    }

    await prisma.promo.create({
      data: {
        name: data.name,
        code: cleanCode,
        type: data.type,
        value: data.value,
        audience: data.audience,
        quotaTotal: data.quotaTotal || null,
        maxClaimsPerUser: data.maxClaimsPerUser || 1,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
        minPurchase: data.minPurchase ? Number(data.minPurchase) : 0,
        maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null,
      }
    });

    revalidatePath('/admin/promos');
    return { success: true };

  } catch (error) {
    console.error("CREATE PROMO ERROR:", error);
    return { error: 'Failed to create promo. Please check the data.' };
  }
});

// 3. TOGGLE PROMO STATUS
export const togglePromoStatusAction = withAdminAction(async (adminId, id: string, isActive: boolean) => {
  await prisma.promo.update({
    where: { id },
    data: { isActive }
  });

  revalidatePath('/admin/promos');
  return { success: true };
});

// 4. DELETE PROMO
export const deletePromoAction = withAdminAction(async (adminId, id: string) => {
  await prisma.promo.delete({
    where: { id }
  });

  revalidatePath('/admin/promos');
  return { success: true };
});