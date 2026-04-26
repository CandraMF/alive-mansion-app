'use server';

import { prisma } from '@/lib/prisma';
import { withAdminAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';


export const getAdminCustomersAction = withAdminAction(async (adminId, params: any = {}) => {
  try {
    const { page = 1, limit = 10, search = '', fetchAll = false } = params;

    const where: any = { role: 'CUSTOMER' };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        ...(fetchAll ? {} : { skip, take: Number(limit) }),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { orders: true } },
          orders: {
            where: { paymentStatus: 'PAID' },
            select: { totalAmount: true }
          }
        }
      }),
      prisma.user.count({ where })
    ]);


    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name || 'Unknown',
      email: user.email || '-',
      isSuspended: user.isSuspended,
      joinedAt: user.createdAt,
      totalOrders: user._count.orders,
      totalSpent: user.orders.reduce((sum, order) => sum + order.totalAmount, 0)
    }));

    return { success: true, data: formattedUsers, total };
  } catch (error) {
    console.error("GET CUSTOMERS ERROR:", error);
    return { success: false, error: "Failed to fetch customers." };
  }
});


export const toggleCustomerSuspendAction = withAdminAction(async (adminId, userId: string, isSuspended: boolean) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isSuspended }
    });

    revalidatePath('/admin/customers');
    return { success: true, message: isSuspended ? 'User has been suspended.' : 'User access restored.' };
  } catch (error) {
    return { success: false, error: "Failed to update user status." };
  }
});