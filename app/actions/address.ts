'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

async function getUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  return user?.id;
}

// 1. Ambil semua alamat user
export async function getAddressesAction() {
  const userId = await getUserId();
  if (!userId) return [];
  return await prisma.address.findMany({
    where: { userId },
    orderBy: { isDefault: 'desc' }
  });
}

// 2. Tambah Alamat Baru
export async function addAddressAction(data: any) {
  const userId = await getUserId();
  if (!userId) return { error: "Unauthorized" };

  try {
    // Jika alamat ini diatur jadi default, matikan default alamat lain
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        label: data.label || 'Home',
        recipientName: data.recipientName,
        phone: data.phone,
        street: data.street,
        cityId: data.cityId,
        cityName: data.cityName,
        provinceId: data.provinceId,
        provinceName: data.provinceName,
        postalCode: data.postalCode,
        isDefault: data.isDefault || false,
      }
    });

    // 🚀 Refresh cache untuk kedua halaman yang menggunakan alamat
    revalidatePath('/checkout');
    revalidatePath('/account');

    return { success: true, address: newAddress };
  } catch (error) {
    console.error("ADD ADDRESS ERROR:", error);
    return { error: "Failed to save address." };
  }
}

// 3. Hapus Alamat
export async function deleteAddressAction(id: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Unauthorized" };

  try {
    await prisma.address.delete({
      where: { id, userId }
    });

    // 🚀 Refresh cache
    revalidatePath('/checkout');
    revalidatePath('/account');

    return { success: true };
  } catch (error) {
    console.error("DELETE ADDRESS ERROR:", error);
    return { error: "Failed to delete address." };
  }
}

// 4. Edit Alamat
export async function editAddressAction(id: string, data: any) {
  const userId = await getUserId();
  if (!userId) return { error: "Unauthorized" };

  try {
    // Jika diset sebagai default, matikan default alamat lain
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id, userId },
      data: {
        label: data.label || 'Home',
        recipientName: data.recipientName,
        phone: data.phone,
        street: data.street,
        cityId: data.cityId,
        cityName: data.cityName,
        provinceId: data.provinceId,
        provinceName: data.provinceName,
        postalCode: data.postalCode,
        isDefault: data.isDefault,
      }
    });

    // 🚀 Refresh cache
    revalidatePath('/checkout');
    revalidatePath('/account');
    
    return { success: true, address: updatedAddress };
  } catch (error) {
    console.error("EDIT ADDRESS ERROR:", error);
    return { error: "Failed to update address." };
  }
}