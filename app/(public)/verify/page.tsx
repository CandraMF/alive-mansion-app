import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  if (!token) {
    return <ResultState type="error" message="Missing verification token." />;
  }

  // 1. Cari token di database
  const existingToken = await prisma.verificationToken.findUnique({
    where: { token }
  });

  if (!existingToken) {
    return <ResultState type="error" message="Invalid or expired token." />;
  }

  // 2. Cek apakah token kadaluarsa
  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    return <ResultState type="error" message="Token has expired. Please register again." />;
  }

  // 3. Cari user berdasarkan email di token
  const existingUser = await prisma.user.findUnique({
    where: { email: existingToken.email }
  });

  if (!existingUser) {
    return <ResultState type="error" message="Email does not exist." />;
  }

  // 4. Update status emailVerified user
  await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      emailVerified: new Date(),
      email: existingToken.email, // Keamanan tambahan
    }
  });

  // 5. Hapus token agar tidak bisa dipakai 2 kali
  await prisma.verificationToken.delete({
    where: { id: existingToken.id }
  });

  return <ResultState type="success" message="Email successfully verified!" />;
}

// --- Komponen UI Reusable ---
function ResultState({ type, message }: { type: 'success' | 'error', message: string }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      {type === 'success' ? (
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
      ) : (
        <XCircle className="w-16 h-16 text-red-500 mb-6" />
      )}
      
      <h1 className="text-2xl font-serif italic mb-2 uppercase tracking-widest text-center">
        {type === 'success' ? 'Verification Success' : 'Verification Failed'}
      </h1>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8 text-center">
        {message}
      </p>

      <Link 
        href={type === 'success' ? "/account" : "/register"}
        className="bg-black text-white px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
      >
        {type === 'success' ? 'Go to Account' : 'Back to Register'}
      </Link>
    </div>
  );
}