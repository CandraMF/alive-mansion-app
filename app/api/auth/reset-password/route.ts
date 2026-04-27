import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Invalid data or password too short." }, { status: 400 });
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.json({ error: "This password reset link is invalid or has expired." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: verificationToken.email }, // ✅ fixed
      data: { password: hashedPassword }
    });

    await prisma.verificationToken.delete({
      where: { token }
    });

    return NextResponse.json({ message: "Password updated successfully." });

  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
  }
}