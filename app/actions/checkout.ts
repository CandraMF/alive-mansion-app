'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';


import { getStoreSettingAction } from './setting';

export async function getCheckoutDataAction() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    throw new Error('Anda harus login untuk melakukan checkout');
  }

  
  const [fees, settings, user] = await Promise.all([
    
    prisma.storeFee.findMany({
      where: { isActive: true }
    }),
    
    
    getStoreSettingAction(),
    
    
    prisma.user.findUnique({
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
}