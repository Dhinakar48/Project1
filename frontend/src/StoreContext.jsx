import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { productsData } from "./data";

const StoreContext = createContext();

const stripProduct = (product) => {
  if (!product) return null;
  const pId = product.product_id || product.id;
  
  // Find the best image: either from images array or from first variant
  let primaryImg = "/placeholder-product.png";
  if (product.images && product.images.length > 0) {
    primaryImg = product.images[0];
  } else if (product.variants && product.variants.length > 0 && product.variants[0].img) {
    primaryImg = product.variants[0].img;
  }

  return {
    product_id: pId,
    id: pId, // For compatibility
    name: product.name,
    price: product.price,
    brand: product.brand,
    images: [primaryImg],
    discount: product.discount || 0
  };
};

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

  const [userProfile, setUserProfile] = useState(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) return JSON.parse(savedProfile);
    
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        is_verified: user.is_verified || false,
        image: user.profile_image || null
      };
    }

    return null;
  });

  useEffect(() => {
    try {
      localStorage.setItem("userProfile", JSON.stringify(userProfile));
    } catch (e) {
      console.error("Profile storage failed", e);
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        localStorage.removeItem("cart"); // Emergency clear
      }
    }
  }, [cart]);

  useEffect(() => {
    const fetchWishlist = async () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.customerId) {
          try {
            const res = await axios.get(`http://localhost:5000/wishlist/${user.customerId}`);
            setWishlist(res.data.map(p => stripProduct(p)));
          } catch (err) {
            console.error("Failed to fetch wishlist:", err);
          }
        }
      }
    };

    const fetchCart = async () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.customerId) {
          try {
            const res = await axios.get(`http://localhost:5000/cart/${user.customerId}`);
            const mapped = res.data.map(item => {
                let primaryImg = "/placeholder-product.png";
                if (item.images && item.images.length > 0) {
                    primaryImg = item.images[0];
                } else {
                    // Fallback to static data
                    const staticP = productsData[item.product_id];
                    if (staticP && staticP.variants && staticP.variants.length > 0) {
                        primaryImg = staticP.variants[0].img;
                    }
                }
                return {
                    product_id: item.product_id,
                    id: item.product_id, // Compatibility
                    name: item.name,
                    price: item.variant_price || item.base_price,
                    brand: item.brand,
                    images: item.images || [primaryImg],
                    quantity: item.quantity,
                    discount: item.discount || 0,
                    variant: {
                        id: item.variant_id,
                        name: item.variant_name,
                        value: item.variant_value,
                        price: item.variant_price || item.base_price,
                        img: primaryImg // Set the image for the variant
                    },
                    variantId: item.variant_id
                };
            });
            setCart(mapped);
          } catch (err) {
            console.error("Fetch cart failed:", err);
          }
        }
      }
    };

    fetchWishlist();
    fetchCart();
  }, []);

  // One-time cleanup to fix QuotaExceededError
  useEffect(() => {
    try {
      const cartTotal = JSON.stringify(cart).length;
      const wishTotal = JSON.stringify(wishlist).length;
      if (cartTotal + wishTotal > 4000000) { // If > 4MB (out of 5MB limit)
         console.warn("Storage usage high, stripping extra data...");
         setCart(prev => prev.map(p => stripProduct(p)));
         setWishlist(prev => prev.map(p => stripProduct(p)));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
       const data = JSON.stringify(wishlist);
       // Optimization: If wishlist is somehow still too huge, don't even try to save to avoid crashing
       if (data.length < 2000000) {
          localStorage.setItem("wishlist", data);
       }
    } catch (e) {
       if (e.name === 'QuotaExceededError') {
         console.warn("Wishlist storage full, clearing old entries...");
         localStorage.removeItem("wishlist");
       }
    }
  }, [wishlist]);

  const addToCart = async (product, variant) => {
    const lightProduct = stripProduct(product);
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === lightProduct.product_id && item.variantId === variant.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === lightProduct.product_id && item.variantId === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      const variantImg = variant.img || lightProduct.images[0];
      return [...prev, { ...lightProduct, variant: { ...variant, img: variantImg }, variantId: variant.id, quantity: 1 }];
    });

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.customerId) {
        try {
          await axios.post("http://localhost:5000/cart/add", {
            customerId: user.customerId,
            productId: lightProduct.product_id,
            variantId: variant.id,
            quantity: 1
          });
        } catch (err) { console.error(err); }
      }
    }
  };

  const removeFromCart = async (productId, variantId) => {
    setCart((prev) => prev.filter((item) => !(item.product_id === productId && item.variantId === variantId)));
    
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.customerId) {
        try {
          await axios.post("http://localhost:5000/cart/remove", {
            customerId: user.customerId,
            productId,
            variantId
          });
        } catch (err) { console.error(err); }
      }
    }
  };

  const updateQuantity = async (productId, variantId, delta) => {
    let newQty = 1;
    setCart((prev) =>
      prev.map((item) => {
        if (item.product_id === productId && item.variantId === variantId) {
            newQty = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQty };
        }
        return item;
      })
    );

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.customerId) {
        try {
          await axios.post("http://localhost:5000/cart/update", {
            customerId: user.customerId,
            productId,
            variantId,
            quantity: newQty
          });
        } catch (err) { console.error(err); }
      }
    }
  };

  const toggleWishlist = async (product) => {
    const lightProduct = stripProduct(product);
    // 1. Optimistic UI update
    setWishlist((prev) => {
      const exists = prev.find((item) => item.product_id === lightProduct.product_id);
      if (exists) {
        return prev.filter((item) => item.product_id !== lightProduct.product_id);
      }
      return [...prev, lightProduct];
    });

    // 2. Sync with backend
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.customerId) {
        try {
          await axios.post("http://localhost:5000/wishlist/toggle", {
            customerId: user.customerId,
            productId: product.product_id
          });
        } catch (err) {
          console.error("Wishlist sync failed:", err);
        }
      }
    }
  };

  const clearCart = () => setCart([]);

  const applyDiscountCode = (code, cartLength = 0) => {
    const uppercaseCode = code.toUpperCase();
    if (uppercaseCode === "SUMMER20") {
      const value = cartLength >= 4 ? 10 : cartLength >= 3 ? 5 : 20;
      setAppliedDiscount({ type: 'percentage', value, code: 'SUMMER20' });
      return { success: true, message: `${value}% discount applied!` };
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

  const rawSubtotal = cart.reduce((total, item) => {
    const priceStr = String(item.variant?.price || 0).replace(/[^\d.]/g, "");
    const price = parseFloat(priceStr) || 0;
    return total + price * item.quantity;
  }, 0);

  const productDiscountAmount = cart.reduce((total, item) => {
    if (item.discount) {
      const priceStr = String(item.variant?.price || 0).replace(/[^\d.]/g, "");
      const price = parseFloat(priceStr) || 0;
      const discount = (price * item.discount) / 100;
      return total + discount * item.quantity;
    }
    return total;
  }, 0);

  const subtotal = rawSubtotal - productDiscountAmount;

  const calculateDiscount = () => {
    if (!appliedDiscount) return 0;
    if (appliedDiscount.type === 'percentage') return (subtotal * appliedDiscount.value) / 100;
    if (appliedDiscount.type === 'fixed') return appliedDiscount.value;
    return 0; // shipping handled separately if needed
  };

  const couponDiscountAmount = calculateDiscount();
  const finalTotal = subtotal - couponDiscountAmount;

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
        rawSubtotal,
        productDiscountAmount,
        subtotal,
        couponDiscountAmount,
        finalTotal,
        userProfile,
        setUserProfile
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
