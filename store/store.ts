import { create } from 'zustand';
import { User, MenuItem, Order, Restaurant } from '../types';

interface CartItem extends MenuItem {
  quantity: number;
}

interface AppState {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Cart
  cart: CartItem[];
  restaurantId: string | null; // Can only order from one restaurant at a time
  addToCart: (item: MenuItem, restaurantId: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: () => number;

  // UI
  darkMode: boolean;
  toggleDarkMode: () => void;
  notifications: string[];
  addNotification: (msg: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),

  cart: [],
  restaurantId: null,

  addToCart: (item, restaurantId) => {
    const { cart, restaurantId: currentResId } = get();
    
    // Check if adding from a different restaurant
    if (currentResId && currentResId !== restaurantId) {
      if (!confirm("Start a new basket? Adding items from a different restaurant will clear your current cart.")) {
        return;
      }
      set({ cart: [], restaurantId });
    } else {
      set({ restaurantId });
    }

    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      set({
        cart: cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      });
    } else {
      set({
        cart: [...cart, { ...item, quantity: 1 }]
      });
    }
  },

  removeFromCart: (itemId) => set((state) => ({
    cart: state.cart.filter(i => i.id !== itemId),
    restaurantId: state.cart.length === 1 ? null : state.restaurantId
  })),

  updateQuantity: (itemId, delta) => set((state) => {
    const newCart = state.cart.map(i => {
      if (i.id === itemId) {
        return { ...i, quantity: Math.max(0, i.quantity + delta) };
      }
      return i;
    }).filter(i => i.quantity > 0);
    
    return {
      cart: newCart,
      restaurantId: newCart.length === 0 ? null : state.restaurantId
    };
  }),

  clearCart: () => set({ cart: [], restaurantId: null }),

  cartTotal: () => {
    const { cart } = get();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  darkMode: false,
  toggleDarkMode: () => set((state) => {
    const newVal = !state.darkMode;
    if (newVal) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    return { darkMode: newVal };
  }),

  notifications: [],
  addNotification: (msg) => set(state => ({ notifications: [...state.notifications, msg] }))
}));
