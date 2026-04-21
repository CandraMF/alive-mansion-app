// app/(public)/layout.tsx
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import AuthProvider from '@/components/AuthProvider'; // 🚀 Import Provider Baru

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  // Ambil data tema langsung dari database
  const themeSettings = await prisma.themeSetting.findUnique({
    where: { key: 'global' }
  });

  // Ambil status login user
  const session = await getServerSession(authOptions);

  // Siapkan data untuk dikirim ke komponen
  const navbarData = themeSettings?.navbar || {};
  const footerData = themeSettings?.footer || {};

  return (
    <div className="relative min-h-screen flex flex-col">
      <LoadingScreen />

      {/* Oper data tema DAN session ke Navbar */}
      <Navbar data={navbarData} session={session} />

      <main className="flex-1 pt-12">
        {/* 🚀 BUNGKUS CHILDREN DENGAN AUTH PROVIDER */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </main>

      <Footer data={footerData} />
    </div>
  );
}