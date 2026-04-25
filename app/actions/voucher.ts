'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function claimVoucherAction(code: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { error: 'Anda harus login untuk klaim voucher.' };
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { error: 'User tidak ditemukan.' };

    const cleanCode = code.toUpperCase().replace(/\s+/g, '');

    // 1. Cari promo di database
    const promo = await prisma.promo.findUnique({ where: { code: cleanCode } });

    if (!promo) return { error: 'Kode promo tidak valid atau tidak ditemukan.' };
    if (!promo.isActive) return { error: 'Promo ini sedang tidak aktif.' };

    // 2. Cek Tanggal Berlaku
    const now = new Date();
    if (promo.startDate && promo.startDate > now) return { error: 'Promo ini belum dimulai.' };
    if (promo.endDate && promo.endDate < now) return { error: 'Promo ini sudah kedaluwarsa.' };

    // 3. Cek Kuota Global
    if (promo.quotaTotal !== null && promo.quotaUsed >= promo.quotaTotal) {
      return { error: 'Maaf, kuota promo ini sudah habis diklaim.' };
    }

    // 4. Cek Batas Klaim per User (Max Claims)
    const userClaimsCount = await prisma.userVoucher.count({
      where: { userId: user.id, promoId: promo.id }
    });

    if (userClaimsCount >= promo.maxClaimsPerUser) {
      return { error: `Anda sudah mencapai batas maksimal klaim (${promo.maxClaimsPerUser}x) untuk voucher ini.` };
    }

    // 5. Eksekusi Klaim: Masukkan ke dompet user & kurangi kuota master
    await prisma.$transaction([
      prisma.userVoucher.create({
        data: {
          userId: user.id,
          promoId: promo.id,
          status: 'AVAILABLE'
        }
      }),
      prisma.promo.update({
        where: { id: promo.id },
        data: { quotaUsed: { increment: 1 } }
      })
    ]);

    revalidatePath('/checkout');
    revalidatePath('/account');
    return { success: true };

  } catch (error) {
    console.error("CLAIM VOUCHER ERROR:", error);
    return { error: 'Terjadi kesalahan pada server saat klaim voucher.' };
  }
}