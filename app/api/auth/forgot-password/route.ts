import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // 1. Check if the email exists in the database
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Standard Security Practice: Don't reveal if the email is unregistered
    if (!user) {
      return NextResponse.json({ message: "If the email is registered, a password reset link has been sent to your inbox." });
    }

    // 2. Generate a Unique Token & Expiration Time (1 Hour)
    const token = uuidv4();
    const expires = new Date(Date.now() + 3600 * 1000); 

    // 3. Save the token to the database (Delete the old one if they requested multiple times)
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires
      }
    });

    // 4. Prepare the Reset Link
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    // 5. Send Email Using Resend
    await resend.emails.send({
      from: `Alive Mansion <${process.env.EMAIL_FROM}>`,
      to: email, // Note: During the Resend trial, this must be your own verified email address
      subject: 'Reset Your Password - Alive Mansion',
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="text-align: center; font-style: italic;">Alive Mansion</h2>
          <p>Someone has requested to reset the password for your account.</p>
          <p>Click the button below to create a new password. This link is only valid for 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; letter-spacing: 2px; font-size: 12px; text-transform: uppercase;">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #666;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    });

    return NextResponse.json({ message: "If the email is registered, a password reset link has been sent to your inbox." });

  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return NextResponse.json({ error: "Failed to process the request." }, { status: 500 });
  }
}