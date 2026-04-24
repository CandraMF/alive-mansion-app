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

// 1. GET ALL FEES
export async function getFeesAction() {
  await verifyAdmin();
  return await prisma.storeFee.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

// 2. CREATE FEE
export async function createFeeAction(data: { name: string; amount: number; isPercentage: boolean }) {
  await verifyAdmin();

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
}

// 3. TOGGLE STATUS
export async function toggleFeeStatusAction(id: string, isActive: boolean) {
  await verifyAdmin();

  await prisma.storeFee.update({
    where: { id },
    data: { isActive }
  });

  revalidatePath('/admin/fees');
  return { success: true };
}

// 4. DELETE FEE
export async function deleteFeeAction(id: string) {
  await verifyAdmin();

  await prisma.storeFee.delete({
    where: { id }
  });

  revalidatePath('/admin/fees');
  return { success: true };
}