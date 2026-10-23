import { createContext, useContext, useState, type ReactNode } from 'react';

type CartState = {
  cart: string[];
  owned: string[];
  add: (gameId: string) => void;
  remove: (gameId: string) => void;
  /** Moves everything in the cart into the library. Real payments come later. */
  checkout: () => void;
};

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<string[]>([]);
  const [owned, setOwned] = useState<string[]>([]);

  const value: CartState = {
    cart,
    owned,
    add: (id) => setCart((c) => (c.includes(id) || owned.includes(id) ? c : [...c, id])),
    remove: (id) => setCart((c) => c.filter((x) => x !== id)),
    checkout: () => {
      setOwned((o) => [...o, ...cart.filter((id) => !o.includes(id))]);
      setCart([]);
    },
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
