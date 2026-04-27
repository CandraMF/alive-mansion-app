import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;


    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }


    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email is already registered. Please log in.' }, { status: 400 });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        lastVerificationRequest: new Date(), // 🚀 Set waktu saat pendaftaran
      }
    });

    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000);


    await prisma.verificationToken.create({
      data: {
        email: newUser.email!,
        token,
        expires,
      }
    });


    await sendVerificationEmail(newUser.email!, token);





    let rewardedPromo = null;


    const welcomePromo = await prisma.promo.findFirst({
      where: {
        audience: 'NEW_USERS_ONLY',
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gt: new Date() } }
        ]
      }
    });


    if (welcomePromo) {

      if (welcomePromo.quotaTotal === null || welcomePromo.quotaUsed < welcomePromo.quotaTotal) {

        await prisma.$transaction([

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


    return NextResponse.json({
      message: 'Registration successful. Please check your email for verification.',
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
      reward: rewardedPromo
    }, { status: 201 });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json({ error: 'An error occurred on the server' }, { status: 500 });
  }
}