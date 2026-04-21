import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // 1. Validasi Input
    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    // 2. Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar. Silakan login.' }, { status: 400 });
    }

    // 3. Enkripsi Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Buat User Baru (Otomatis jadi CUSTOMER sesuai default di Prisma)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // Role dan permissions tidak perlu diisi, Prisma otomatis mengatur role: CUSTOMER dan permissions: []
      }
    });

    return NextResponse.json({
      message: 'Registrasi berhasil',
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    }, { status: 201 });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}