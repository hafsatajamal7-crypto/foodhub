import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('foodhub-cart') || '[]'); }
    catch { return []; }
  });

  useEffect(() => localStorage.setItem('foodhub-cart', JSON.stringify(items)), [items]);

  function addToCart(food) {
    setItems((current) => {
      const found = current.find((item) => item.id === food.id);
      return found
        ? current.map((item) => item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...food, quantity: 1 }];
    });
  }

  function updateQuantity(id, amount) {
    setItems((current) => current
      .map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item)
      .filter((item) => item.quantity > 0));
  }

  function removeFromCart(id) { setItems((current) => current.filter((item) => item.id !== id)); }
  function clearCart() { setItems([]); }

  const value = useMemo(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
