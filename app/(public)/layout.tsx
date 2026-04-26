// app/(public)/layout.tsx
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import AuthProvider from '@/components/AuthProvider';
import InitCart from '@/components/InitCart'; 
import PromoModal from '@/components/PromoModal';
// 🚀 1. Import komponen baru
import SuspendShield from '@/components/SuspendShield'; 

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const themeSettings = await prisma.themeSetting.findUnique({ where: { key: 'global' } });
  const session = await getServerSession(authOptions);

  return (
    <div className="relative min-h-screen flex flex-col">
      <LoadingScreen />
      <Navbar data={themeSettings?.navbar || {}} session={session} />

      <main className="flex-1 pt-12">
        <AuthProvider>
          <SuspendShield />
          <InitCart />
          <PromoModal />
          {children}
        </AuthProvider>
      </main>

      <Footer data={themeSettings?.footer || {}} />
    </div>
  );
}