import { Resend } from 'resend';
import { VerificationTemplate } from '@/components/emails/verification-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Alive Mansion <noreply@alivemansion.com>',
      to: [email],
      subject: 'Welcome to Alive Mansion - Verify your email',
      react: VerificationTemplate({ confirmLink }),
    });

    if (error) {
      console.error("RESEND ERROR (VERIFICATION):", error);
    } else {
      console.log("RESEND SUCCESS (VERIFICATION):", data);
    }

    return { data, error };
  } catch (err) {
    console.error("SEND EMAIL CATCH ERROR:", err);
    return { error: err };
  }
};