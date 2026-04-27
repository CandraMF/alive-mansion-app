import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';
import { ResetPasswordTemplate } from '@/components/emails/reset-password-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set!");
      return NextResponse.json({ error: "Server misconfiguration." }, { status: 500 });
    }

    const { email } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: "If the email is registered, a password reset link has been sent." }, { status: 200 });
    }

    const token = uuidv4();
    const expires = new Date(Date.now() + 3600 * 1000);

    await prisma.verificationToken.deleteMany({ where: { email } });

    await prisma.verificationToken.create({
      data: { email, token, expires }
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
    const resetLink = `${appUrl}/reset-password?token=${token}`;

    // 🚀 MENGGUNAKAN REACT TEMPLATE DARI DOKUMENTASI RESEND
    const { data, error } = await resend.emails.send({
      from: 'Alive Mansion <noreply@alivemansion.com>', // Pastikan ini domain Anda
      to: [email], // 🚀 Pakai kurung siku (Array)
      subject: 'Reset Your Password - Alive Mansion',
      react: ResetPasswordTemplate({ resetLink }), // 🚀 Panggil komponen React
    });

    console.log("API Key present:", !!process.env.RESEND_API_KEY);
    console.log("Reset link:", resetLink);
    console.log("Sending to:", email);

    if (error) {
      console.error("RESEND ERROR RESPONSE:", error);
      return NextResponse.json({ error: "Email delivery failed." }, { status: 500 });
    }

    console.log("RESEND SUCCESS:", data); // Cek ID pengiriman di terminal
    return NextResponse.json({ message: "Reset link sent." }, { status: 200 });

  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json({ error: "Failed to process the request." }, { status: 500 });
  }
}