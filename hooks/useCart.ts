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
  weight: number; 
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  selectedItems: string[];
  fetchCart: () => Promise<void>;
  // 🚀 1. Izinkan pengiriman quantity sebagai parameter opsional
  addItem: (data: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<void>;
  removeItem: (id: string, size: string) => Promise<void>;
  updateQuantity: (id: string, size: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleSelect: (id: string, size: string) => void;
  toggleSelectAll: (isSelected: boolean) => void;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  selectedItems: [],
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const items = await getCartAction() as CartItem[];
      const allSelected = items.map(item => `${item.id}-${item.size}`);
      set({ items, selectedItems: allSelected });
    } catch (error) {
      console.error("Gagal menarik data keranjang", error);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleSelect: (id, size) => set((state) => {
    const key = `${id}-${size}`;
    const isSelected = state.selectedItems.includes(key);
    return {
      selectedItems: isSelected 
        ? state.selectedItems.filter(k => k !== key) 
        : [...state.selectedItems, key]
    };
  }),

  toggleSelectAll: (isSelected) => set((state) => ({
    selectedItems: isSelected ? state.items.map(item => `${item.id}-${item.size}`) : []
  })),

  addItem: async (data) => {
    // 🚀 2. Ambil quantity dari input UI (default 1 jika tidak ada)
    const qtyToAdd = data.quantity || 1; 
    
    const currentItems = get().items;
    const existingItem = currentItems.find((item) => item.id === data.id && item.size === data.size);

    if (existingItem) {
      set({ 
        items: currentItems.map((item) => 
          item.id === data.id && item.size === data.size 
            ? { ...item, quantity: item.quantity + qtyToAdd } // 🚀 Tambahkan sesuai input
            : item 
        ) 
      });
    } else {
      set({ items: [...currentItems, { ...data, quantity: qtyToAdd }] }); // 🚀 Set sesuai input
    }

    try {
      await addToCartAction(data.id, qtyToAdd); // 🚀 Kirim quantity ke server
    } catch (error) {
      console.error("Gagal menambah ke database", error);
      await get().fetchCart(); 
    }
  },

  removeItem: async (id, size) => {
    const keyToRemove = `${id}-${size}`;
    set({ 
      items: get().items.filter((item) => !(item.id === id && item.size === size)),
      selectedItems: get().selectedItems.filter(k => k !== keyToRemove)
    }); 
    try { await removeFromCartAction(id); } 
    catch (error) { await get().fetchCart(); }
  },

  updateQuantity: async (id, size, quantity) => {
    set({ 
      items: get().items.map((item) => 
        item.id === id && item.size === size 
          ? { ...item, quantity } 
          : item
      ) 
    }); 
    try {
      await updateCartItemAction(id, quantity); 
    } catch (error) {
      console.error("Gagal update quantity di database", error);
      await get().fetchCart();
    }
  },

  clearCart: async () => {
    set({ items: [] }); 
    try {
        await clearCartAction(); 
    } catch (error) {
        console.error("Gagal mengosongkan keranjang di database", error);
        await get().fetchCart();
    }
  },
}));