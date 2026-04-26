'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { withAuthAction } from '@/lib/safe-action';

export const claimVoucherAction = withAuthAction(async (userId, code: string) => {
  try {
    // 1. Cari Promo berdasarkan kode
    const promo = await prisma.promo.findUnique({
      where: { code: code.toUpperCase() },
      include: { claimedVouchers: { where: { userId } } }
    });

    if (!promo || !promo.isActive) {
      return { success: false, error: 'Voucher code is invalid or has expired.' };
    }

    // 2. Cek apakah periode promo valid
    const now = new Date();
    if (promo.startDate > now || (promo.endDate && promo.endDate < now)) {
      return { success: false, error: 'Voucher is not active at this time.' };
    }

    // 3. Cek Quota Total Promo
    if (promo.quotaTotal !== null && promo.quotaUsed >= promo.quotaTotal) {
      return { success: false, error: 'Voucher quota has been reached.' };
    }

    // 4. Cek limit klaim per user
    if (promo.claimedVouchers.length >= promo.maxClaimsPerUser) {
      return { success: false, error: 'You have already reached the maximum claim limit for this voucher.' };
    }

    // 5. Eksekusi Klaim
    await prisma.$transaction([
      prisma.userVoucher.create({
        data: {
          userId: userId,
          promoId: promo.id,
          status: 'AVAILABLE'
        }
      }),
      prisma.promo.update({
        where: { id: promo.id },
        data: { quotaUsed: { increment: 1 } }
      })
    ]);

    revalidatePath('/account');
    return { success: true, message: 'Voucher claimed successfully!' };

  } catch (error) {
    console.error(error);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
});