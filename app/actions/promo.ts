'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

// 🔒 SECURITY CHECK: Pastikan hanya Admin / Staff yang bisa menjalankan fungsi ini
async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || role === 'CUSTOMER') {
    throw new Error('Unauthorized Access: Admin / Staff Only');
  }
}

// 1. GET ALL PROMOS (Menampilkan daftar promo di tabel admin)
export async function getPromosAction() {
  await verifyAdmin();

  return await prisma.promo.findMany({
    orderBy: { createdAt: 'desc' },
    // Ambil juga jumlah user spesifik jika promo ini tipe SPECIFIC_USERS
    include: {
      _count: {
        select: { allowedUsers: true }
      }
    }
  });
}

// 2. CREATE PROMO (Membuat voucher baru)
export async function createPromoAction(data: any) {
  await verifyAdmin();

  try {
    // Format kode: Huruf besar semua dan hilangkan spasi (misal: " welcome 50 " -> "WELCOME50")
    const cleanCode = data.code.toUpperCase().replace(/\s+/g, '');

    // Cek apakah kode sudah pernah dipakai
    const existingPromo = await prisma.promo.findUnique({
      where: { code: cleanCode }
    });

    if (existingPromo) {
      return { error: 'Promo code already exists! Please use a different code.' };
    }

    // Simpan ke database
    await prisma.promo.create({
      data: {
        ...data,
        code: cleanCode,
      }
    });

    // 🚀 Refresh halaman admin secara instan tanpa perlu reload browser
    revalidatePath('/admin/promos');
    return { success: true };

  } catch (error) {
    console.error("CREATE PROMO ERROR:", error);
    return { error: 'Failed to create promo. Please check the data.' };
  }
}

// 3. TOGGLE STATUS (Tombol switch on/off voucher dengan cepat)
export async function togglePromoStatusAction(id: string, isActive: boolean) {
  await verifyAdmin();

  await prisma.promo.update({
    where: { id },
    data: { isActive }
  });

  revalidatePath('/admin/promos');
  return { success: true };
}

// 4. DELETE PROMO (Menghapus voucher permanen)
export async function deletePromoAction(id: string) {
  await verifyAdmin();

  await prisma.promo.delete({
    where: { id }
  });

  revalidatePath('/admin/promos');
  return { success: true };
}