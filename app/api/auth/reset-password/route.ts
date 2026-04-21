import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    // 1. Basic validation
    if (!token || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Invalid data or password too short." }, { status: 400 });
    }

    // 2. Find the token in the database
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    // 3. Check if token exists and is not expired
    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.json({ error: "This password reset link is invalid or has expired." }, { status: 400 });
    }

    // 4. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 5. Update the user's password
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { password: hashedPassword }
    });

    // 6. Delete the token so it cannot be used again
    await prisma.verificationToken.delete({
      where: { token }
    });

    return NextResponse.json({ message: "Password updated successfully." });

  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
  }
}