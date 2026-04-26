import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Package, MapPin, Receipt, ExternalLink } from 'lucide-react';
import Image from 'next/image';

const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
const formatDate = (date: Date) => new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect('/login');

  const resolvedParams = await params;
  const orderId = resolvedParams.id;

  // Ambil Order dan pastikan milik user yang sedang login (Security Check)
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    // 🚀 FIX: Tambahkan user: true agar Security Check di bawahnya bisa membaca email
    include: { items: true, user: true }
  });

  // Jika order tidak ada ATAU email di order tidak sama dengan email user yang login, usir ke account!
  if (!order || order.user?.email !== session.user.email) redirect('/account');

  // Pisahkan string alamat untuk UI
  const [recipient, phone, ...addressParts] = order.shippingAddress.split(' - ');
  const fullAddress = addressParts.join(' - ');

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-32 font-sans text-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        
        <div className="mb-8">
          <Link href="/account" className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Orders
          </Link>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm">
          {/* HEADER INVOICE */}
          <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold uppercase tracking-tighter mb-2">Order Details</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Ref: #{order.id.slice(-8).toUpperCase()} • {formatDate(order.createdAt)}
              </p>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-3">
               <div className="flex gap-2">
                 <span className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest border ${
                   order.paymentStatus === 'PAID' ? 'bg-green-50 border-green-200 text-green-700' : 
                   order.paymentStatus === 'UNPAID' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-red-50 border-red-200 text-red-700'
                 }`}>
                   Payment: {order.paymentStatus}
                 </span>
                 <span className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest border bg-gray-50 border-gray-200 text-gray-700">
                   Status: {order.orderStatus}
                 </span>
               </div>
               
               {/* TOMBOL BAYAR JIKA UNPAID */}
               {order.paymentStatus === 'UNPAID' && order.paymentUrl && (
                 <a 
                   href={order.paymentUrl} 
                   className="inline-flex items-center gap-2 bg-black text-white px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                 >
                   Pay Now <ExternalLink className="w-3 h-3" />
                 </a>
               )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8 border-b border-gray-100">
            {/* SHIPPING INFO */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-gray-400" />
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">Shipping Address</h2>
              </div>
              <div className="bg-gray-50 p-4 border border-gray-100 space-y-1 text-xs">
                <p className="font-bold uppercase">{recipient}</p>
                <p className="text-gray-600">{phone}</p>
                <p className="text-gray-500 leading-relaxed pt-2">{fullAddress}</p>
              </div>
            </div>

            {/* COURIER INFO */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-gray-400" />
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">Delivery Method</h2>
              </div>
              <div className="bg-gray-50 p-4 border border-gray-100 space-y-1 text-xs">
                <p className="font-bold uppercase">{order.courier} - {order.courierService}</p>
                {order.resiNumber ? (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">Tracking Number (Resi)</p>
                    <p className="font-mono font-bold tracking-widest text-blue-600">{order.resiNumber}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 pt-2 text-[10px] uppercase tracking-widest italic">Preparing to ship...</p>
                )}
              </div>
            </div>
          </div>

          {/* ORDER ITEMS */}
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Receipt className="w-4 h-4 text-gray-400" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">Purchased Items</h2>
            </div>
            
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="w-16 h-20 bg-gray-100 relative shrink-0">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><Package className="w-6 h-6" /></div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-xs font-bold uppercase tracking-tight mb-1">{item.name}</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                      Color: <span className="text-black font-bold">{item.color}</span> • Size: <span className="text-black font-bold">{item.size}</span> • Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right flex flex-col justify-center">
                    <p className="text-xs font-bold">{formatRupiah(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* PRICE BREAKDOWN */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="w-full md:w-1/2 ml-auto space-y-3 text-[11px] uppercase tracking-wider font-medium">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatRupiah(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping Cost</span>
                  <span>{formatRupiah(order.shippingCost)}</span>
                </div>
                {order.taxAmount > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Taxes & Fees</span>
                    <span>{formatRupiah(order.taxAmount)}</span>
                  </div>
                )}
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatRupiah(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-2">
                  <span className="text-[10px] font-bold tracking-[0.2em]">Total</span>
                  <span className="text-lg font-bold text-black">{formatRupiah(order.totalAmount)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}