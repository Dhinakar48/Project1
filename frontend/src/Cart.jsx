import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "./StoreContext";
import { useNavigate, Link } from "react-router-dom";
import {
  FaTrash, FaMinus, FaPlus, FaArrowLeft,
  FaCcVisa, FaCcMastercard, FaCcApplePay, FaCreditCard,
  FaArrowRight, FaShieldHalved, FaTag, FaCartShopping,
} from "react-icons/fa6";

export default function Cart() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    rawSubtotal,
    productDiscountAmount,
    subtotal,
    couponDiscountAmount,
    finalTotal,
    appliedDiscount,
    removeDiscount,
    applyDiscountCode,
  } = useStore();
  const navigate = useNavigate();

  const platformFee = 15;
  const totalPayable = finalTotal + platformFee;
  const offerPercent = cart.length >= 4 ? 10 : 5; // tiered: 3 items = 5%, 4+ items = 10%

  const perks = [
    { icon: "🛡️", bg: "bg-amber-100", text: "text-amber-600", title: "Free Protection", sub: "Covered on every order" },
    { icon: "🔄", bg: "bg-violet-100", text: "text-violet-600", title: "Easy Returns", sub: "7-day hassle-free" },
    { icon: "🔒", bg: "bg-pink-100", text: "text-pink-600", title: "Secure Pay", sub: "256-bit encryption" },
    { icon: "⭐", bg: "bg-green-100", text: "text-green-600", title: "Quality Promise", sub: "Verified products" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-amber-50 pt-10 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-6">

        {/* ── Back button ── */}
        <motion.button
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition mb-10 group"
          onClick={() => navigate("/")}
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition" />
          <span className="font-medium tracking-wide">Back to Store</span>
        </motion.button>

        {/* ── Title ── */}
        <h1 className="text-4xl md:text-5xl font-bold text-stone-900 tracking-tight leading-none mb-1">
          Shopping Cart
        </h1>
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest py-6">
          {cart.length} {cart.length === 1 ? "item" : "items"} in your bag
        </p>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">

          {/* ── LEFT: Items ── */}
          <div>
            <AnimatePresence mode="popLayout">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <motion.div
                    key={`${item.id}-${item.variantId}`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30, scale: 0.96 }}
                    transition={{ duration: 0.3 }}
                    className="relative flex gap-5 bg-white border border-stone-200 rounded-2xl p-6 mb-4 shadow-sm overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="flex-shrink-0 w-30 h-35 bg-gradient-to-br from-stone-50 to-stone-100 rounded-xl flex items-center justify-center overflow-hidden">
                      <Link to={`/product/${item.product_id}`} className="block w-full h-full">
                        <img
                          src={item.variant?.img || (item.images && item.images[0]) || "/placeholder-product.png"}
                          alt={item.name}
                          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600 mb-1">
                        {item.title}
                      </p>
                      <Link to={`/product/${item.product_id}`} className="hover:text-amber-600 transition-colors">
                        <h2 className="text-lg font-bold text-stone-900 tracking-tight leading-snug mb-3">
                          {item.name}
                        </h2>
                      </Link>

                      <div className="flex items-center flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 bg-stone-100 border border-stone-200 rounded-full px-3 py-1 text-[10px] font-bold text-stone-600 uppercase tracking-wide">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: item.variant.hex || "#000" }}
                          />
                          {item.variant.colorName}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-[10px] font-bold text-green-700 uppercase tracking-wide">
                          ✓ In Stock
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Qty control */}
                        <div className="flex items-center bg-stone-100 border border-stone-200 rounded-xl p-1 gap-1">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.variantId, -1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-600 hover:bg-white hover:shadow-sm transition-all duration-200 active:scale-90"
                          >
                            <FaMinus size={9} />
                          </button>
                          <span className="w-9 text-center font-black text-stone-900 text-sm tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.variantId, 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-600 hover:bg-white hover:shadow-sm transition-all duration-200 active:scale-90"
                          >
                            <FaPlus size={9} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          {item.discount ? (
                            <>
                              <p className="text-xl font-black text-stone-900 tracking-tight">
                                ₹{(parseFloat(String(item.variant?.price || 0).replace(/[^\d.]/g, "")) * (1 - item.discount / 100)).toLocaleString()}
                              </p>
                              <p className="text-[12px] text-red-500 font-bold line-through opacity-70">
                                ₹{parseFloat(String(item.variant?.price || 0)).toLocaleString()}
                              </p>
                            </>
                          ) : (
                            <p className="text-xl font-black text-stone-900 tracking-tight">
                              ₹{parseFloat(String(item.variant?.price || 0)).toLocaleString()}
                            </p>
                          )}
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">
                            per unit
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeFromCart(item.product_id, item.variantId)}
                      className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all duration-500 shadow-sm active:scale-95 group/remove"
                    >
                      <FaTrash size={14} className="group-hover/remove:rotate-12 transition-transform" />
                    </button>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  className="flex flex-col items-center justify-center py-20 px-8 bg-white rounded-2xl border-2 border-dashed border-stone-200 text-center gap-4"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-600 text-2xl mb-2">
                    <FaCartShopping />
                  </div>
                  <p className="text-xl font-black text-stone-900 tracking-tight">Your cart is empty</p>
                  <p className="text-sm text-stone-400 font-medium">Looks like you haven't added anything yet.</p>
                  <motion.button
                    className="bg-gradient-to-r from-amber-600 to-amber-500 text-white border-none rounded-xl px-8 py-3.5 font-black text-xs uppercase tracking-widest cursor-pointer mt-2"
                    onClick={() => navigate("/")}
                    whileHover={{ scale: 1.02, opacity: 0.9 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Continue Shopping
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── RIGHT: Summary + Perks ── */}
          <div>
            <div className="bg-white shadow-sm border border-stone-200 rounded-2xl p-8 relative overflow-hidden">

              {/* Glow */}
              <div className="absolute -top-14 -right-14 w-48 h-48 rounded-full bg-white/20 blur-2xl pointer-events-none" />

              <div className="relative z-10">
                <p className="text-2xl font-bold tracking-tight text-stone-900 pb-4 mb-6 border-b border-stone-900/15">
                  Order Summary
                </p>

                {/* ── Offer banner (3+ items, no discount) ── */}
                <AnimatePresence>
                  {cart.length >= 3 && !appliedDiscount && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-between gap-3 bg-black/10 border border-dashed border-stone-900/30 rounded-xl px-4 py-3 mb-4">
                        <div className="flex items-start gap-2.5">
                          <span className="text-xl leading-none mt-0.5 flex-shrink-0">🎉</span>
                          <div>
                            <p className="text-[11px] font-black text-stone-900 leading-snug">
                              {cart.length >= 4 ? "Big order offer unlocked!" : "Multi-item offer unlocked!"}
                            </p>
                            <p className="text-[10px] text-stone-700 font-medium mt-0.5">
                              Use <strong>SUMMER20</strong> for <strong>{offerPercent}%</strong> off your order
                            </p>
                          </div>
                        </div>
                        <button
                          className="flex-shrink-0 bg-stone-900 text-amber-400 border-none rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider cursor-pointer hover:bg-stone-800 hover:scale-105 transition-all duration-150"
                          onClick={() => applyDiscountCode("SUMMER20", cart.length)}
                        >
                          Apply
                        </button>
                      </div>
                      <p className="text-[10px] font-bold text-stone-900/70 text-center tracking-wide mb-4">
                        🚚 Also try <strong>FREESHIP</strong> for free shipping
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Line items */}
                <div className="flex justify-between items-center mb-3.5">
                  <span className="text-sm font-semibold text-stone-700">Bag Total</span>
                  <span className="text-sm font-bold text-stone-400 line-through">₹{rawSubtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center mb-3.5 text-green-700">
                  <span className="text-sm font-semibold">Discount</span>
                  <span className="text-sm font-bold">−₹{productDiscountAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center mb-3.5 py-3 border-t border-stone-100">
                  <span className="text-sm font-semibold text-stone-700">Subtotal</span>
                  <span className="text-sm font-bold text-stone-900">₹{subtotal.toLocaleString()}</span>
                </div>

                {appliedDiscount && (
                  <div className="flex items-center justify-between bg-black/[0.07] border border-black/10 rounded-xl px-3 py-2 mb-3.5">
                    <div className="flex items-center gap-2 text-green-900 text-[11px] font-bold">
                      <FaTag size={10} />
                      Coupon ({appliedDiscount.code})
                      <button
                        className="text-[9px] border border-green-900 rounded-md px-1.5 py-0.5 font-black uppercase hover:bg-green-900 hover:text-white transition-colors cursor-pointer bg-transparent text-green-900"
                        onClick={removeDiscount}
                      >
                        Remove
                      </button>
                    </div>
                    <span className="text-sm font-bold text-green-900">
                      −₹{couponDiscountAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center mb-3.5">
                  <span className="text-sm font-semibold text-stone-700">Platform Fee</span>
                  <span className="text-sm font-bold text-stone-900">
                    ₹{platformFee}
                  </span>
                </div>


                {/* Total */}
                <div className="flex justify-between items-end pt-4 mt-2 mb-6 border-t border-stone-900/15">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-stone-700">Total Payable</p>
                  </div>
                  <p className="text-3xl font-black text-stone-900 tracking-tighter leading-none">
                    ₹{totalPayable.toLocaleString()}
                  </p>
                </div>

                {/* Checkout button */}
                <motion.button
                  className={`w-full bg-stone-900 text-amber-500 hover:text-white border-none rounded-2xl py-5 font-black text-xs uppercase tracking-[0.14em] flex items-center justify-center gap-2.5 shadow-lg shadow-stone-900/30 transition-all ${cart.length === 0 ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-stone-800"}`}
                  onClick={() => cart.length > 0 && navigate("/order")}
                  // whileHover={cart.length > 0 ? { scale: 1.02 } : {}}
                  whileTap={cart.length > 0 ? { scale: 0.98 } : {}}
                >
                  Proceed to Checkout
                  <FaArrowRight size={13} />
                </motion.button>

                {/* Trust + Payment icons — only shown when 3+ items */}
                <AnimatePresence>
                  {cart.length >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="mt-6 pt-5 border-t border-stone-900/15"
                    >
                      <div className="flex items-center gap-2 text-stone-900 mb-2">
                        <FaShieldHalved size={13} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Secure Checkout</span>
                      </div>
                      <p className="text-[10px] text-stone-700 font-medium leading-relaxed mb-4">
                        Your payment information is encrypted with 256-bit SSL technology.
                      </p>
                      <div className="flex gap-2">
                        {[FaCcVisa, FaCcMastercard, FaCcApplePay, FaCreditCard].map((Icon, i) => (
                          <div key={i} className="bg-white/40 border border-white/20 rounded-lg px-2.5 py-1.5 flex items-center justify-center text-stone-900 text-xl">
                            <Icon />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Perks bar — only shown when 3+ items ── */}
            <AnimatePresence>
              {cart.length >= 4 && (
                <motion.div
                  className="grid grid-cols-2 gap-3 mt-5"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {perks.map((p) => (
                    <div key={p.title} className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${p.bg} ${p.text} flex items-center justify-center text-base flex-shrink-0`}>
                        {p.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-900 leading-tight">{p.title}</p>
                        <p className="text-[10px] text-stone-400 font-medium mt-0.5">{p.sub}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
