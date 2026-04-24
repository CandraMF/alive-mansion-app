'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getCheckoutDataAction() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    throw new Error('Anda harus login untuk melakukan checkout');
  }

  // 1. Ambil Biaya Toko (Admin Fees) yang aktif
  const fees = await prisma.storeFee.findMany({
    where: { isActive: true }
  });

  // 2. Ambil Voucher User yang berstatus 'AVAILABLE' dan belum kadaluarsa
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      vouchers: {
        where: { 
          status: 'AVAILABLE',
          promo: {
            isActive: true,
            OR: [
              { endDate: null },
              { endDate: { gt: new Date() } }
            ]
          }
        },
        include: { promo: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  return {
    fees: fees || [],
    vouchers: user?.vouchers || []
  };
}