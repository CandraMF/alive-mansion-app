'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { withAdminAction } from '@/lib/safe-action';

// 1. Ambil Pengaturan Toko (Publik: bisa diakses dari mana saja)
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
          originCityId: '6011', // 🚀 Lembang (Kab. Bandung Barat)
          originCityName: 'Bandung Barat (Lembang)',
          activeCouriers: 'jne,sicepat,ide,sap,jnt,ninja,tiki,lion,anteraja,pos,ncs,rex,rpx,sentral,star,wahana,dse',
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

// 2. Update Pengaturan Toko (Khusus Admin)
export const updateStoreSettingAction = withAdminAction(async (adminId, data: any) => {
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
});