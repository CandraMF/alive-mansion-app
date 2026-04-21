import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET: Ambil isi keranjang dari database saat user login
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json([], { status: 401 });

  const cartItems = await prisma.cartItem.findMany({
    where: { user: { email: session.user.email } },
    include: {
      variant: {
        include: {
          product: true,
          size: true,
          color: true
        }
      }
    }
  });

  // Format data agar sesuai dengan struktur useCart di frontend
  const formattedItems = cartItems.map(item => ({
    id: item.variantId,
    name: item.variant.product.name,
    price: item.variant.price,
    image: item.variant.product.images[0]?.url || '', // Sederhanakan sesuai kebutuhan UI
    size: item.variant.size.name,
    quantity: item.quantity
  }));

  return NextResponse.json(formattedItems);
}

// POST: Sinkronisasi seluruh state keranjang lokal ke database
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items } = await req.json(); // Array of CartItem dari frontend

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Gunakan transaksi untuk membersihkan data lama dan memasukkan data baru (Overwrite Sync)
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { userId: user.id } }),
      prisma.cartItem.createMany({
        data: items.map((item: any) => ({
          userId: user.id,
          variantId: item.id,
          quantity: item.quantity
        }))
      })
    ]);

    return NextResponse.json({ message: "Cart synced successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to sync cart" }, { status: 500 });
  }
}