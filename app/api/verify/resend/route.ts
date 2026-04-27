import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from '@/lib/mail';

const COOLDOWN_TIME = 60 * 1000; // 60 Detik

// 🚀 FUNGSI GET: Hanya untuk mengecek sisa waktu (dipanggil saat halaman pertama dibuka)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { lastVerificationRequest: true, emailVerified: true }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    
    // Jika sudah terverifikasi, kembalikan waktu 0
    if (user.emailVerified) return NextResponse.json({ secondsLeft: 0, isVerified: true }, { status: 200 });

    let secondsLeft = 0;
    const now = new Date().getTime();

    if (user.lastVerificationRequest) {
      const lastReqTime = user.lastVerificationRequest.getTime();
      const timePassed = now - lastReqTime;

      if (timePassed < COOLDOWN_TIME) {
        secondsLeft = Math.ceil((COOLDOWN_TIME - timePassed) / 1000);
      }
    }

    return NextResponse.json({ secondsLeft }, { status: 200 });
  } catch (error) {
    console.error("GET COOLDOWN ERROR:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 🚀 FUNGSI POST: Untuk mengeksekusi pengiriman ulang email
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.emailVerified) return NextResponse.json({ error: 'Already verified' }, { status: 400 });

    // CEK COOLDOWN DI SERVER
    const now = new Date();
    const lastRequest = user.lastVerificationRequest;

    if (lastRequest && (now.getTime() - lastRequest.getTime() < COOLDOWN_TIME)) {
      const secondsLeft = Math.ceil((COOLDOWN_TIME - (now.getTime() - lastRequest.getTime())) / 1000);
      return NextResponse.json({ 
        error: `Please wait ${secondsLeft}s before requesting again.`,
        secondsLeft 
      }, { status: 429 }); // 429: Too Many Requests
    }

    // Update Token & Timestamp Request Terakhir
    const token = uuidv4();
    const expires = new Date(now.getTime() + 3600 * 1000);

    await prisma.$transaction([
      prisma.verificationToken.deleteMany({ where: { email } }),
      prisma.verificationToken.create({ data: { email, token, expires } }),
      prisma.user.update({
        where: { email },
        data: { lastVerificationRequest: now }
      })
    ]);

    await sendVerificationEmail(email, token);
    return NextResponse.json({ message: 'Success' }, { status: 200 });

  } catch (error) {
    console.error("POST RESEND ERROR:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}