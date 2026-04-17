import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <LoadingScreen />

      <Navbar />

      <main className="flex-1 pt-12">
        {children}
      </main>

      <Footer />
    </div>
  );
}