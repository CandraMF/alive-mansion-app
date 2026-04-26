'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { withAuthAction } from '@/lib/safe-action';

// 1. Ambil semua alamat user
export const getAddressesAction = withAuthAction(async (userId) => {
  return await prisma.address.findMany({
    where: { userId },
    orderBy: { isDefault: 'desc' }
  });
});

// 2. Tambah Alamat Baru
export const addAddressAction = withAuthAction(async (userId, data: any) => {
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
});

// 3. Hapus Alamat
export const deleteAddressAction = withAuthAction(async (userId, id: string) => {
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
});

// 4. Edit Alamat
export const editAddressAction = withAuthAction(async (userId, id: string, data: any) => {
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
});