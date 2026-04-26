'use server';

import { prisma } from '@/lib/prisma';
import { withAuthAction } from '@/lib/safe-action';
import { getStoreSettingAction } from './setting';

export const getCheckoutDataAction = withAuthAction(async (userId) => {
  const [fees, settings, user] = await Promise.all([
    // 1. Ambil fee toko yang aktif
    prisma.storeFee.findMany({
      where: { isActive: true }
    }),
    
    // 2. Ambil pengaturan toko
    getStoreSettingAction(),
    
    // 3. Ambil data user beserta vouchernya menggunakan userId dari wrapper
    prisma.user.findUnique({
      where: { id: userId },
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
    })
  ]);

  return {
    fees: fees || [],
    settings: settings, 
    vouchers: user?.vouchers || [],
    user: {             
      name: user?.name || '',
      email: user?.email || '',
    }
  };
});