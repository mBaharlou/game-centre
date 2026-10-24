import { createContext, useContext, useState, type ReactNode } from 'react';

type CartState = {
  cart: string[];
  add: (gameId: string) => void;
  remove: (gameId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<string[]>([]);

  const value: CartState = {
    cart,
    add: (id) => setCart((c) => (c.includes(id) ? c : [...c, id])),
    remove: (id) => setCart((c) => c.filter((x) => x !== id)),
    clear: () => setCart([]),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
