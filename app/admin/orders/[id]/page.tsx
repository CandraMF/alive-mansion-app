import { getAdminOrderDetailAction } from '@/app/actions/admin-order';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Package, User, MapPin, CreditCard, Truck } from 'lucide-react';
import OrderStatusManager from './OrderStatusManager';

const formatRupiah = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const res = await getAdminOrderDetailAction(params.id);

  if (!res.success || !res.data) {
    return notFound();
  }

  const order = res.data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/admin/orders" className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black mb-4 transition-colors">
            <ChevronLeft className="w-3 h-3 mr-1" /> Back to Orders
          </Link>
          <h1 className="text-2xl font-bold uppercase tracking-tighter">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Placed on {new Date(order.createdAt).toLocaleString('id-ID')}</p>
        </div>
        
        {/* Status Manager (Client Component) */}
        <OrderStatusManager orderId={order.id} currentStatus={order.orderStatus} currentResi={order.resiNumber || ''} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Items & Payment */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Order Items */}
          <section className="bg-white border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-4 h-4 text-gray-400" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest">Order Items ({order.items.length})</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items.map((item: any) => (
                <div key={item.id} className="py-4 flex items-center gap-4">
                  <div className="w-16 h-20 bg-gray-50 shrink-0 overflow-hidden border border-gray-100">
                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold uppercase truncate">{item.name}</p>
                    <p className="text-[9px] text-gray-400 uppercase mt-1">{item.color} / {item.size}</p>
                    <p className="text-[10px] font-medium mt-1">{item.quantity} x {formatRupiah(item.price)}</p>
                  </div>
                  <p className="text-xs font-bold">{formatRupiah(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Cost Summary */}
          <section className="bg-gray-50 border border-gray-100 p-6 md:p-8">
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-500">
                <span>Subtotal</span>
                <span className="font-bold text-black">{formatRupiah(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-500">
                <span>Shipping ({order.courier} - {order.courierService})</span>
                <span className="font-bold text-black">{formatRupiah(order.shippingCost)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-red-500">
                  <span>Discount</span>
                  <span className="font-bold">-{formatRupiah(order.discountAmount)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200 flex justify-between items-end">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Total Amount</span>
                <span className="text-xl font-bold">{formatRupiah(order.totalAmount)}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Kolom Kanan: Customer & Shipping Address */}
        <div className="space-y-8">
          
          {/* Customer Info */}
          <section className="bg-white border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-4 h-4 text-gray-400" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest">Customer</h2>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase">{order.user.name}</p>
              <p className="text-[11px] text-gray-500">{order.user.email}</p>
              <p className="text-[11px] text-gray-500">{order.user.phone || '-'}</p>
            </div>
          </section>

          {/* Shipping Address */}
          <section className="bg-white border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-4 h-4 text-gray-400" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest">Shipping Address</h2>
            </div>
            <div className="text-[11px] text-gray-500 leading-relaxed">
              <p className="font-bold text-black uppercase mb-1">{order.address?.recipientName}</p>
              <p>{order.address?.phone}</p>
              <p className="mt-2 italic">{order.shippingAddress}</p>
            </div>
          </section>

          {/* Payment Info */}
          <section className="bg-white border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <h2 className="text-[10px] font-bold uppercase tracking-widest">Payment Status</h2>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-[9px] font-bold px-3 py-1 uppercase tracking-widest ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {order.paymentStatus}
              </span>
              {order.paymentMethod && <span className="text-[10px] font-medium uppercase text-gray-400">{order.paymentMethod}</span>}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}