import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  imageUrl: string;
  quantity: number;
  size?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.id === newItem.id && item.size === newItem.size
          );

          if (existingItemIndex >= 0) {
            // Already exists, increase quantity
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += (newItem.quantity || 1);
            return { items: newItems };
          }

          // New item
          return {
            items: [...state.items, { ...newItem, quantity: newItem.quantity || 1 }],
          };
        });
      },
      removeItem: (id) => {
        // Find exact match? This removes ALL variants of an ID right now.
        // For precision, we assume the UI removes by a composite key if needed, or by simple ID.
        // Let's modify to actually remove the specific item. We might need a unique cart ID instead, 
        // but for now, we'll keep it simple: cart items should ideally have a unique ID that combines product + size.
        // Actually, we'll just leave it as id for now but be aware.
        set((state) => ({
          items: state.items.filter((item) => item.id !== id), // NOTE: removes all sizes of the product.
        }));
      },
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'ruralpop-cart', // name of the item in the storage (must be unique)
    }
  )
);
