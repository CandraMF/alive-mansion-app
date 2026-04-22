'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

// 🔒 SECURITY CHECK
async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || role === 'CUSTOMER') {
    throw new Error('Unauthorized Access: Admin / Staff Only');
  }
}

export async function getPromosAction() {
  await verifyAdmin();

  return await prisma.promo.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { claimedVouchers: true }
      }
    }
  });
}

export async function createPromoAction(data: any) {
  await verifyAdmin();

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

        // 🚀 TAMBAHAN: Kondisi Minimal Belanja & Maksimal Diskon
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
}

export async function togglePromoStatusAction(id: string, isActive: boolean) {
  await verifyAdmin();

  await prisma.promo.update({
    where: { id },
    data: { isActive }
  });

  revalidatePath('/admin/promos');
  return { success: true };
}

export async function deletePromoAction(id: string) {
  await verifyAdmin();

  await prisma.promo.delete({
    where: { id }
  });

  revalidatePath('/admin/promos');
  return { success: true };
}