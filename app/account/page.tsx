import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { User as UserIcon, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import ClientLogout from './ClientLogout';
import AccountTabs from './AccountTabs'; 

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect('/register');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      vouchers: {
        orderBy: { createdAt: 'desc' },
        include: { promo: true }
      },
      orders: {
        orderBy: { createdAt: 'desc' },
        include: { items: true } 
      }
    }
  });

  if (!user) redirect('/register');

  return (
    <div className="min-h-screen bg-white text-black pt-28 pb-24 px-4 md:px-12 font-sans">
      <div className="max-w-[1200px] mx-auto">

        {/* 🚀 TOMBOL BACK TO HOME */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
          </Link>
        </div>

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-8 mb-12 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif italic mb-2">My Account</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Member Dashboard</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">Account</p>
              <p className="text-[10px] font-bold uppercase tracking-widest">{user.name}</p>
            </div>
            <ClientLogout />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* PROFILE SUMMARY SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-8 rounded-sm sticky top-24">
              <div className="flex items-center gap-3 mb-8">
                <UserIcon className="w-4 h-4" />
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">Profile Info</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-[8px] text-gray-400 uppercase tracking-widest mb-1">Full Name</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest">{user.name}</p>
                </div>
                <div>
                  <p className="text-[8px] text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
                  <p className="text-[10px] font-bold lowercase tracking-wider">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA: TABS & FILTERS */}
          <div className="lg:col-span-3">
            <AccountTabs orders={user.orders} vouchers={user.vouchers} />
          </div>
        </div>
      </div>
    </div>
  );
}