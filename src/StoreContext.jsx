import { createContext, useContext, useState, useEffect } from "react";

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedDiscount, setAppliedDiscount] = useState(null);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (product, variant) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id && item.variantId === variant.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.variantId === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, variant, variantId: variant.id, quantity: 1 }];
    });
  };

  const removeFromCart = (productId, variantId) => {
    setCart((prev) => prev.filter((item) => !(item.id === productId && item.variantId === variantId)));
  };

  const updateQuantity = (productId, variantId, delta) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId && item.variantId === variantId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const clearCart = () => setCart([]);

  const applyDiscountCode = (code) => {
    const uppercaseCode = code.toUpperCase();
    if (uppercaseCode === "SUMMER20") {
      setAppliedDiscount({ type: 'percentage', value: 20, code: 'SUMMER20' });
      return { success: true, message: "20% discount applied!" };
    }
    if (uppercaseCode === "FLASH5K") {
      setAppliedDiscount({ type: 'fixed', value: 5000, code: 'FLASH5K' });
      return { success: true, message: "₹5,000 discount applied!" };
    }
    if (uppercaseCode === "FREESHIP") {
      setAppliedDiscount({ type: 'shipping', value: 0, code: 'FREESHIP' });
      return { success: true, message: "Free shipping applied!" };
    }
    return { success: false, message: "Invalid discount code." };
  };

  const removeDiscount = () => setAppliedDiscount(null);

  const subtotal = cart.reduce((total, item) => {
    const price = parseInt(item.variant.price.replace(/[^\d]/g, ""));
    return total + price * item.quantity;
  }, 0);

  const calculateDiscount = () => {
    if (!appliedDiscount) return 0;
    if (appliedDiscount.type === 'percentage') return (subtotal * appliedDiscount.value) / 100;
    if (appliedDiscount.type === 'fixed') return appliedDiscount.value;
    return 0; // shipping handled separately if needed
  };

  const discountAmount = calculateDiscount();
  const finalTotal = subtotal - discountAmount;

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleWishlist,
        clearCart,
        appliedDiscount,
        applyDiscountCode,
        removeDiscount,
        subtotal,
        discountAmount,
        finalTotal
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
