import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // 1. Validasi Input
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // 2. Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email is already registered. Please log in.' }, { status: 400 });
    }

    // 3. Enkripsi Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Buat User Baru
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    });

    // ==========================================
    // 🚀 5. AUTO-CLAIM WELCOME VOUCHER
    // ==========================================
    let rewardedPromo = null;

    // Cari promo khusus pengguna baru yang masih aktif
    const welcomePromo = await prisma.promo.findFirst({
      where: {
        audience: 'NEW_USERS_ONLY',
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gt: new Date() } } // Belum expired
        ]
      }
    });

    // Jika promo ditemukan, masukkan ke dompet user
    if (welcomePromo) {
      // Cek apakah masih ada kuota (jika kuota dibatasi)
      if (welcomePromo.quotaTotal === null || welcomePromo.quotaUsed < welcomePromo.quotaTotal) {

        await prisma.$transaction([
          // A. Buat tiket di dompet user
          prisma.userVoucher.create({
            data: {
              userId: newUser.id,
              promoId: welcomePromo.id,
              status: 'AVAILABLE'
            }
          }),
          // B. Tambah hitungan kuota terpakai di master Promo
          prisma.promo.update({
            where: { id: welcomePromo.id },
            data: { quotaUsed: { increment: 1 } }
          })
        ]);

        rewardedPromo = {
          name: welcomePromo.name,
          code: welcomePromo.code,
          type: welcomePromo.type,
          value: welcomePromo.value
        };
      }
    }

    // Kembalikan response sukses beserta info hadiahnya (jika ada)
    return NextResponse.json({
      message: 'Registration successful',
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
      reward: rewardedPromo // Data ini akan ditangkap oleh frontend
    }, { status: 201 });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json({ error: 'An error occurred on the server' }, { status: 500 });
  }
}