'use server';

import { prisma } from '@/lib/prisma';
import { withAdminAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';
import { Xendit } from 'xendit-node';

const xendit = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY || '' });


// 1. Ambil Semua Pesanan untuk Dashboard Admin
export const getAdminOrdersAction = withAdminAction(async (adminId, params: any = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = 'ALL',
      paymentStatus = 'ALL',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      fetchAll = false // 🚀 Flag khusus untuk Export CSV
    } = params;

    // 1. Bangun Query Kondisi (Where Clause)
    const where: any = {};

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (status !== 'ALL') where.orderStatus = status;
    if (paymentStatus !== 'ALL') where.paymentStatus = paymentStatus;

    // 2. Hitung Offset untuk Pagination
    const skip = (page - 1) * limit;

    // 3. Eksekusi Query secara Paralel (Ambil Data & Hitung Total Baris)
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        ...(fetchAll ? {} : { skip, take: Number(limit) }), // Jika fetchAll true, jangan dilimit
        include: {
          user: { select: { name: true, email: true } },
          items: true,
        }
      }),
      prisma.order.count({ where })
    ]);

    return { success: true, data: orders, total };
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
        // 🚀 HAPUS phone: true dari sini
        user: { select: { name: true, email: true } }, 
        items: {
          include: {
            product: { select: { name: true, images: true } }
          }
        },
        address: true, // Data address (termasuk phone) sudah ditarik utuh di sini
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

export const syncOrderWithXenditAction = withAdminAction(async (adminId, orderId: string) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { xenditInvoiceId: true, userId: true, voucherCode: true }
    });

    if (!order || !order.xenditInvoiceId) {
      return { success: false, error: "Invoice ID tidak ditemukan untuk pesanan ini." };
    }

    // Ambil data langsung dari Xendit
    const xenditInvoice = await xendit.Invoice.getInvoiceById({ 
      invoiceId: order.xenditInvoiceId 
    });

    const status = xenditInvoice.status;
    let updateData: any = {};

    // Logika mapping status sama dengan Webhook 
    if (status === 'PAID' || status === 'SETTLED') {
      updateData = {
        paymentStatus: 'PAID',
        paymentMethod: xenditInvoice.paymentMethod || 'XENDIT',
        orderStatus: 'PROCESSING',
      };
    } else if (status === 'EXPIRED') {
      updateData = {
        paymentStatus: 'EXPIRED',
        orderStatus: 'CANCELLED',
      };
      
      // Tambahan: Logika refund voucher jika diperlukan seperti di webhook 
    } else {
      return { success: true, message: `Status di Xendit masih ${status}. Tidak ada perubahan.` };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: updateData
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');

    return { success: true, message: `Status berhasil diperbarui menjadi ${status}!` };
  } catch (error: any) {
    console.error("SYNC XENDIT ERROR:", error);
    return { success: false, error: "Gagal terhubung ke Xendit." };
  }
});