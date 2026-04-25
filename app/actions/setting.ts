'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 1. Ambil Pengaturan Toko
export async function getStoreSettingAction() {
  try {
    let setting = await prisma.storeSetting.findUnique({
      where: { id: 'default' }
    });

    // Jika belum ada data sama sekali (pertama kali run), buatkan data default
    if (!setting) {
      setting = await prisma.storeSetting.create({
        data: {
          id: 'default',
          storeName: 'Alive Mansion',
          originCityId: '24', // 🚀 Lembang (Kab. Bandung Barat)
          originCityName: 'Bandung Barat (Lembang)',
          activeCouriers: 'jne,jnt,sicepat',
          whatsappNumber: '628123456789'
        }
      });
    }

    return setting;
  } catch (error) {
    console.error("GET SETTING ERROR:", error);
    return null;
  }
}

// 2. Update Pengaturan Toko (Untuk Panel Admin nanti)
export async function updateStoreSettingAction(data: any) {
  try {
    const updated = await prisma.storeSetting.update({
      where: { id: 'default' },
      data
    });
    revalidatePath('/checkout');
    revalidatePath('/admin/settings');
    return { success: true, data: updated };
  } catch (error) {
    return { error: "Gagal memperbarui pengaturan." };
  }
}