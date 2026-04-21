import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Package, User as UserIcon, Clock } from 'lucide-react';
import ClientLogout from './ClientLogout';
import Link from 'next/link';

// Format currency
const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format date
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export default async function AccountPage() {
  // 1. Secure the page: Get the session
  const session = await getServerSession(authOptions);

  // 2. If not logged in, kick them to the login page
  if (!session || !session.user?.email) {
    redirect('/register');
  }

  // 3. Fetch the user's order history from Prisma
  // We match the logged-in email with the customerEmail in the Order table
  const orders = await prisma.order.findMany({
    where: {
      customerEmail: session.user.email
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: true,
              size: true,
              color: true
            }
          }
        }
      }
    }
  });

  return (
    <div className="min-h-screen bg-white text-black pt-8 pb-24 px-4 md:px-12 font-sans">
      <div className="max-w-[1200px] mx-auto">

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-8 mb-12 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif italic mb-2">My Account</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
              Welcome back, {session.user.name || 'Member'}
            </p>
          </div>
          <ClientLogout />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* LEFT COLUMN: PROFILE INFO */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-gray-50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <UserIcon className="w-5 h-5" />
                <h2 className="text-xs font-bold uppercase tracking-widest">Account Details</h2>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Name</p>
                  <p className="font-medium">{session.user.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Email</p>
                  <p className="font-medium">{session.user.email}</p>
                </div>
              </div>
            </div>

            {/* You can add another box here later for Saved Addresses or Vouchers */}
          </div>

          {/* RIGHT COLUMN: ORDER HISTORY */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-5 h-5" />
              <h2 className="text-xs font-bold uppercase tracking-widest">Order History</h2>
            </div>

            {orders.length === 0 ? (
              <div className="bg-gray-50 p-12 text-center border border-dashed border-gray-200">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                <h3 className="text-sm font-bold uppercase tracking-widest mb-2">No Orders Yet</h3>
                <p className="text-xs text-gray-500 mb-6">You haven't placed any orders with this account.</p>
                <Link href="/shop">
                  <button className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
                    Start Shopping
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow bg-white">
                    <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-gray-100 pb-4 mb-4 gap-4">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Order #{order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs font-bold">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Amount</p>
                        <p className="text-sm font-bold">{formatRupiah(order.totalAmount)}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <span className={`inline-block px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                          }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            {/* Quantity Badge */}
                            <span className="text-[10px] font-bold bg-gray-100 w-6 h-6 flex items-center justify-center rounded-full">
                              {item.quantity}x
                            </span>
                            <div>
                              <p className="font-medium">{item.variant.product.name}</p>
                              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                                {item.variant.color.name} / {item.variant.size.name}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs font-medium text-gray-600">
                            {formatRupiah(item.priceAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}