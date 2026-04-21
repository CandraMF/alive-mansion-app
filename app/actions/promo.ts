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

// 1. GET ALL PROMOS
export async function getPromosAction() {
  await verifyAdmin();

  return await prisma.promo.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        // 🚀 MENGHITUNG BERAPA TIKET YANG SUDAH DIKLAIM USER
        select: { claimedVouchers: true }
      }
    }
  });
}

// 2. CREATE PROMO
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
        minPurchase: data.minPurchase,
        audience: data.audience,
        quotaTotal: data.quotaTotal || null,         // 🚀 DATA BARU
        maxClaimsPerUser: data.maxClaimsPerUser || 1 // 🚀 DATA BARU
      }
    });

    revalidatePath('/admin/promos');
    return { success: true };

  } catch (error) {
    console.error("CREATE PROMO ERROR:", error);
    return { error: 'Failed to create promo. Please check the data.' };
  }
}

// 3. TOGGLE STATUS
export async function togglePromoStatusAction(id: string, isActive: boolean) {
  await verifyAdmin();

  await prisma.promo.update({
    where: { id },
    data: { isActive }
  });

  revalidatePath('/admin/promos');
  return { success: true };
}

// 4. DELETE PROMO
export async function deletePromoAction(id: string) {
  await verifyAdmin();

  await prisma.promo.delete({
    where: { id }
  });

  revalidatePath('/admin/promos');
  return { success: true };
}