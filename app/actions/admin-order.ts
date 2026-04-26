'use server';

import { prisma } from '@/lib/prisma';
import { withAdminAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';

// 1. Ambil Semua Pesanan untuk Dashboard Admin
export const getAdminOrdersAction = withAdminAction(async (adminId) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { 
          select: { name: true, email: true } 
        },
        items: true,
        // Kita tidak wajib me-load seluruh detail address di tabel utama agar ringan,
        // tapi cukup untuk melihat kota tujuan
      }
    });
    return { success: true, data: orders };
  } catch (error) {
    console.error("GET ADMIN ORDERS ERROR:", error);
    return { success: false, error: "Gagal mengambil data pesanan." };
  }
});

// 2. Ambil Detail 1 Pesanan (Untuk halaman detail/modal)
export const getAdminOrderDetailAction = withAdminAction(async (adminId, orderId: string) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: {
          include: {
            product: { select: { name: true, images: true } }
          }
        },
        address: true,
      }
    });
    
    if (!order) return { success: false, error: "Pesanan tidak ditemukan." };
    return { success: true, data: order };
  } catch (error) {
    return { success: false, error: "Gagal mengambil detail pesanan." };
  }
});

// 3. Update Status & Input Resi
export const updateOrderStatusAction = withAdminAction(async (adminId, orderId: string, status: string, resiNumber?: string) => {
  try {
    const updateData: any = { orderStatus: status };
    
    // Jika resi diisi (misal status berubah jadi SHIPPED), masukkan ke database
    if (resiNumber !== undefined) {
      updateData.resiNumber = resiNumber;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData
    });

    revalidatePath('/admin/orders');
    return { success: true, data: updatedOrder };
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    return { success: false, error: "Gagal memperbarui pesanan." };
  }
});