import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// 🚀 1. Wrapper untuk User Biasa (Wajib Login)
export function withAuthAction<Args extends any[], ReturnType>(
  action: (userId: string, ...args: Args) => Promise<ReturnType>
) {
  return async (...args: Args): Promise<ReturnType | { error: string }> => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { error: "Unauthorized: Silakan login terlebih dahulu." };

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { error: "Unauthorized: Akun tidak ditemukan." };

    // Teruskan userId (yang sudah pasti aman) ke fungsi utama
    return action(user.id, ...args);
  };
}

// 🚀 2. Wrapper untuk Admin (Wajib Login & Wajib Role ADMIN)
export function withAdminAction<Args extends any[], ReturnType>(
  action: (userId: string, ...args: Args) => Promise<ReturnType>
) {
  return async (...args: Args): Promise<ReturnType | { error: string }> => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { error: "Unauthorized: Silakan login terlebih dahulu." };

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role !== 'ADMIN') {
      return { error: "Forbidden: Akses ditolak. Tindakan ini hanya untuk Admin." };
    }

    return action(user.id, ...args);
  };
}