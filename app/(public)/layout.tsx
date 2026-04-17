// app/(public)/layout.tsx
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';
import { prisma } from '@/lib/prisma'; // 🚀 Import prisma

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  // 🚀 Ambil data tema langsung dari database
  const themeSettings = await prisma.themeSetting.findUnique({
    where: { key: 'global' }
  });

  // Siapkan data untuk dikirim ke komponen
  const navbarData = themeSettings?.navbar || {};
  const footerData = themeSettings?.footer || {};

  return (
    <div className="relative min-h-screen flex flex-col">
      <LoadingScreen />

      {/* 🚀 Oper data ke Navbar */}
      <Navbar data={navbarData} />

      <main className="flex-1 pt-12">
        {children}
      </main>

      <Footer data={footerData} />
    </div>
  );
}