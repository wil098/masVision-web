import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Estado inicial leyendo desde el localStorage del navegador
  const [cart, setCart] = useState(() => {
    const localData = localStorage.getItem('masVision_cart');
    return localData ? JSON.parse(localData) : [];
  });

  // Guardar en localStorage de forma automática ante cualquier cambio
  useEffect(() => {
    localStorage.setItem('masVision_cart', JSON.stringify(cart));
  }, [cart]);

  // Agregar producto o incrementar cantidad
  const addToCart = (product) => {
    setCart((currCart) => {
      // Buscamos si el ID del producto ya está en el carrito
      const isProductInCart = currCart.find((item) => item.id === product.id);

      if (isProductInCart) {
        return currCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...currCart, { ...product, quantity: 1 }];
    });
  };

  // Eliminar un producto completo por ID
  const removeFromCart = (productId) => {
    setCart((currCart) => currCart.filter((item) => item.id !== productId));
  };

  // Modificar cantidades (+1 o -1)
  const updateQuantity = (productId, amount) => {
    setCart((currCart) =>
      currCart
        .map((item) => {
          if (item.id === productId) {
            const newQuantity = item.quantity + amount;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // Vaciar por completo
  const clearCart = () => setCart([]);

  // Totales calculados automáticamente
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.precio || item.price || 0) * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado para consumir el carrito de forma sencilla
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser utilizado dentro de un CartProvider');
  }
  return context;
};