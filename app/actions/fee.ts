'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { withAdminAction } from '@/lib/safe-action';

// 1. GET ALL FEES
export const getFeesAction = withAdminAction(async (adminId) => {
  return await prisma.storeFee.findMany({
    orderBy: { createdAt: 'desc' }
  });
});

// 2. CREATE FEE
export const createFeeAction = withAdminAction(async (adminId, data: { name: string; amount: number; isPercentage: boolean }) => {
  try {
    await prisma.storeFee.create({
      data: {
        name: data.name,
        amount: data.amount,
        isPercentage: data.isPercentage,
        isActive: true,
      }
    });

    revalidatePath('/admin/fees');
    return { success: true };
  } catch (error) {
    console.error("CREATE FEE ERROR:", error);
    return { error: 'Failed to create fee.' };
  }
});

// 3. TOGGLE STATUS
export const toggleFeeStatusAction = withAdminAction(async (adminId, id: string, isActive: boolean) => {
  await prisma.storeFee.update({
    where: { id },
    data: { isActive }
  });

  revalidatePath('/admin/fees');
  return { success: true };
});

// 4. DELETE FEE
export const deleteFeeAction = withAdminAction(async (adminId, id: string) => {
  await prisma.storeFee.delete({
    where: { id }
  });

  revalidatePath('/admin/fees');
  return { success: true };
});