import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Tipe Data untuk Barang di Keranjang
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
}

// 2. Tipe Data untuk Fungsi-fungsi Keranjang
interface CartStore {
  items: CartItem[];
  addItem: (data: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
}

// 3. Membuat Store dengan Zustand + LocalStorage
export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      // Fungsi Menambah Barang
      addItem: (data) => {
        const currentItems = get().items;
        // Cek apakah barang dengan ID dan Ukuran yang SAMA sudah ada di keranjang
        const existingItem = currentItems.find(
          (item) => item.id === data.id && item.size === data.size
        );

        if (existingItem) {
          // Jika sudah ada, tambahkan quantity-nya saja
          set({
            items: currentItems.map((item) =>
              item.id === data.id && item.size === data.size
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          // Jika belum ada, masukkan sebagai barang baru dengan quantity 1
          set({ items: [...currentItems, { ...data, quantity: 1 }] });
        }
      },

      // Fungsi Menghapus Barang Spesifik
      removeItem: (id, size) => {
        set({
          items: get().items.filter((item) => !(item.id === id && item.size === size)),
        });
      },

      // Fungsi Mengubah Jumlah Barang (+ / -)
      updateQuantity: (id, size, quantity) => {
        set({
          items: get().items.map((item) =>
            item.id === id && item.size === size ? { ...item, quantity } : item
          ),
        });
      },

      // Fungsi Mengosongkan Keranjang (Setelah Checkout)
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage', // Nama key yang akan disimpan di LocalStorage browser
    }
  )
);