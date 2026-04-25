import { create } from 'zustand';
import { 
  getCartAction, addToCartAction, 
  updateCartItemAction, removeFromCartAction, clearCartAction 
} from '@/app/actions/cart';

export interface CartItem {
  id: string; 
  name: string;
  price: number;
  image: string;
  size: string;
  color: string; 
  quantity: number;
  weight: number; // 🚀 TAMBAHAN: Properti berat untuk kalkulasi ongkir
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (data: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeItem: (id: string, size: string) => Promise<void>;
  updateQuantity: (id: string, size: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  isLoading: false,

  // Tarik data dari Database saat pertama kali masuk web
  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const items = await getCartAction();
      set({ items });
    } catch (error) {
      console.error("Gagal menarik data keranjang", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (data) => {
    const currentItems = get().items;
    // Cek berdasarkan ID dan Size agar tidak tercampur jika beli produk sama tapi beda ukuran
    const existingItem = currentItems.find((item) => item.id === data.id && item.size === data.size);

    if (existingItem) {
      set({ 
        items: currentItems.map((item) => 
          item.id === data.id && item.size === data.size 
            ? { ...item, quantity: item.quantity + 1 } 
            : item 
        ) 
      });
    } else {
      set({ items: [...currentItems, { ...data, quantity: 1 }] });
    }

    // 2. Kirim ke Database
    try {
      await addToCartAction(data.id, 1);
    } catch (error) {
      console.error("Gagal menambah ke database", error);
      await get().fetchCart(); // Jika gagal, kembalikan tampilan sesuai database
    }
  },

  removeItem: async (id, size) => {
    // Optimistic hapus berdasarkan ID dan Size
    set({ items: get().items.filter((item) => !(item.id === id && item.size === size)) }); 
    try {
      await removeFromCartAction(id); // Asumsi backend hanya butuh variantId (id)
    } catch (error) {
      console.error("Gagal menghapus dari database", error);
      await get().fetchCart();
    }
  },

  updateQuantity: async (id, size, quantity) => {
    // Optimistic update berdasarkan ID dan Size
    set({ 
      items: get().items.map((item) => 
        item.id === id && item.size === size 
          ? { ...item, quantity } 
          : item
      ) 
    }); 
    try {
      await updateCartItemAction(id, quantity); // Asumsi backend hanya butuh variantId (id)
    } catch (error) {
      console.error("Gagal update quantity di database", error);
      await get().fetchCart();
    }
  },

  clearCart: async () => {
    set({ items: [] }); // Optimistic
    try {
        await clearCartAction(); // Database
    } catch (error) {
        console.error("Gagal mengosongkan keranjang di database", error);
        await get().fetchCart();
    }
  },
}));