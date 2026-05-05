import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { productsData } from "./data";

const StoreContext = createContext();

const stripProduct = (product) => {
  if (!product) return null;
  const pId = product.product_id || product.id;
  
  // Try to get data from data.js if it's a static product
  const staticData = productsData[pId];
  const name = product.name || staticData?.name || "Unknown Product";
  const brand = product.brand || staticData?.specs?.brand || "Electro";
  
  // Find the best image
  let primaryImg = "/placeholder-product.png";
  if (product.images && product.images.length > 0) {
    primaryImg = product.images[0];
  } else if (staticData?.variants && staticData.variants.length > 0) {
    primaryImg = staticData.variants[0].img;
  } else if (product.variants && product.variants.length > 0 && product.variants[0].img) {
    primaryImg = product.variants[0].img;
  }

  return {
    product_id: pId,
    id: pId,
    name: name,
    price: product.price || staticData?.variants[0].price.replace(/[^\d.]/g, ''),
    mrp: product.mrp || product.price || staticData?.variants[0].mrp?.replace(/[^\d.]/g, '') || staticData?.variants[0].price.replace(/[^\d.]/g, ''),
    brand: brand,
    images: [primaryImg],
    discount: product.discount || staticData?.discount || 0
  };
};

export function StoreProvider({ children }) {
  const navigate = useNavigate();
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
    const savedUser = localStorage.getItem("user");
    
    let profile = null;
    if (savedProfile) {
      profile = JSON.parse(savedProfile);
    }
    
    if (savedUser) {
      const user = JSON.parse(savedUser);
      // Ensure customerId is always present if we have a saved user
      if (!profile || !profile.customerId) {
        profile = {
          ...(profile || {}),
          customerId: user.customerId || user.customer_id || "",
          name: profile?.name || user.name || "",
          email: profile?.email || user.email || "",
          is_verified: profile?.is_verified || user.is_verified || false,
          image: profile?.image || user.profilePicture || user.profile_image || null
        };
      }
    }

    return profile;
  });

  const logout = async () => {
    try {
      if (userProfile) {
        const userId = userProfile.customerId || userProfile.id;
        const userType = userProfile.seller_id ? 'seller' : 'customer';
        await axios.post("http://localhost:5000/api/logout", { userId, userType });
      }
    } catch (err) {
      console.error("Backend logout failed:", err);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("userProfile");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminActiveTab");
      setUserProfile(null);
      navigate("/login");
    }
  };

  useEffect(() => {
    try {
      if (userProfile) {
        // Strip out the base64 image before saving to localStorage to avoid QuotaExceededError
        const { image, ...safeProfile } = userProfile;
        localStorage.setItem("userProfile", JSON.stringify(safeProfile));
      }
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
                    mrp: item.variant_mrp || item.base_mrp || item.variant_price || item.base_price,
                    brand: item.brand,
                    images: item.images || [primaryImg],
                    quantity: item.quantity,
                    discount: item.discount || 0,
                    variant: {
                        id: item.variant_id,
                        name: item.variant_name,
                        value: item.variant_value,
                        price: item.variant_price || item.base_price,
                        mrp: item.variant_mrp || item.base_mrp || item.variant_price || item.base_price,
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

    // Session Monitoring: Check if user is blocked in real-time
    const checkUserStatus = async () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        const userId = user.customerId || user.id;
        if (userId) {
          try {
            const res = await axios.get(`http://localhost:5000/api/verify-user-status/${userId}`);
            if (res.data.success && res.data.is_active === false) {
              // User has been blocked!
              console.warn("Session Expired: Account blocked by administrator.");
              localStorage.removeItem("user");
              localStorage.removeItem("userProfile");
              setUserProfile(null);
              setCart([]);
              setWishlist([]);
              window.location.href = "/?message=blocked";
            }
          } catch (err) {
            console.error("Session verification failed", err);
          }
        }
      }
    };

    const interval = setInterval(checkUserStatus, 30000); // Check every 30 seconds
    checkUserStatus(); // Initial check

    return () => clearInterval(interval);
  }, [userProfile]);

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
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      alert("Please login to add products to your cart.");
      navigate("/login");
      return false;
    }

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
    return true;
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

  const applyDiscountCode = async (code, cartTotal = 0) => {
    if (!code) return { success: false, message: "Please enter a coupon code." };
    
    try {
       const res = await axios.post("http://localhost:5000/api/validate", {
          code,
          cartTotal
       });

       if (res.data.success) {
          const coupon = res.data.coupon;
          setAppliedDiscount({ 
            type: coupon.type.toLowerCase(), 
            value: coupon.discount_percent, 
            maxDiscount: coupon.max_discount,
            code: coupon.code 
          });
          return { success: true, message: "Coupon applied successfully!" };
       } else {
          return { success: false, message: res.data.message || "Invalid coupon." };
       }
    } catch (err) {
       console.error("Coupon validation error:", err);
       return { success: false, message: "Server error validating coupon." };
    }
  };

  const removeDiscount = () => setAppliedDiscount(null);

  // New Requirement:
  // Bag Total = Sum of MRPs
  // Subtotal = Sum of Selling Prices
  // Discount = Bag Total - Subtotal
  
  const rawSubtotal = cart.reduce((total, item) => {
    const mrp = parseFloat(String(item.variant?.mrp || item.mrp || 0).replace(/[^\d.]/g, ''));
    const price = parseFloat(String(item.variant?.price || item.price || 0).replace(/[^\d.]/g, ''));
    // Bag Total should be the higher of the two (MRP or Price) to prevent logical errors
    const effectiveMrp = Math.max(mrp, price);
    return total + effectiveMrp * item.quantity;
  }, 0);

  const subtotal = cart.reduce((total, item) => {
    const p = parseFloat(String(item.variant?.price || item.price || 0).replace(/[^\d.]/g, ''));
    return total + p * item.quantity;
  }, 0);

  const productDiscountAmount = rawSubtotal - subtotal;

  const calculateDiscount = () => {
    if (!appliedDiscount) return 0;
    if (appliedDiscount.type === 'percentage') {
       let d = (subtotal * appliedDiscount.value) / 100;
       if (appliedDiscount.maxDiscount && d > appliedDiscount.maxDiscount) {
          d = appliedDiscount.maxDiscount;
       }
       return d;
    }
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
        setUserProfile,
        logout
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
