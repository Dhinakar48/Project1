import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "./StoreContext";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaMinus, FaPlus, FaArrowLeft, FaLock, FaCcVisa, FaCcMastercard, FaCcApplePay, FaCreditCard, FaArrowRight } from "react-icons/fa6";

export default function Cart() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    finalTotal,
    appliedDiscount,
    removeDiscount
  } = useStore();
  const navigate = useNavigate();

  const shippingFee = appliedDiscount?.type === 'shipping' ? 0 : 150;
  const gstAmount = Math.round(finalTotal * 0.06);
  const totalPayable = finalTotal + shippingFee + gstAmount;

  return (
    <div className="min-h-screen bg-white text-stone-900 py-12 px-6 md:px-16 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition mb-10 group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition" />
          <span className="font-medium tracking-wide">Back to Store</span>
        </button>

        <h1 className="text-3xl md:text-5xl font-black mb-12 tracking-tighter">Shopping Bag</h1>

        <div className="flex flex-col gap-16">
          <div className="w-full space-y-8">
            <AnimatePresence mode="popLayout">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <motion.div
                    key={`${item.id}-${item.variantId}`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col sm:flex-row gap-8 p-8 bg-white rounded-[2.5rem] border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 group relative overflow-hidden"
                  >
                    <div className="w-full sm:w-44 h-44 bg-stone-50 rounded-3xl flex-shrink-0 overflow-hidden relative group-hover:bg-stone-100 transition-colors duration-500">
                      <img
                        src={item.variant.img}
                        alt={item.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition duration-700 p-6"
                      />
                    </div>

                    <div className="flex-grow flex flex-col justify-between py-2">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{item.title}</p>
                            <h2 className="text-2xl font-black text-stone-900 tracking-tight leading-tight">{item.name}</h2>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-black text-stone-900 tracking-tighter">{item.variant.price}</p>
                            <p className="text-[10px] text-stone-400 font-bold uppercase mt-1">Single Unit</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-2 px-4 py-2 bg-stone-50 rounded-full text-stone-500 text-[10px] font-bold uppercase border border-stone-200/50">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.variant.hex || '#000' }}></span>
                            {item.variant.colorName}
                          </span>
                          <span className="text-stone-300">|</span>
                          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">In Stock</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-8">
                        <div className="flex items-center p-1 bg-stone-100 rounded-2xl border border-stone-200/60 shadow-inner">
                          <button
                            onClick={() => updateQuantity(item.id, item.variantId, -1)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all duration-300 text-stone-600 shadow-sm active:scale-90"
                          >
                            <FaMinus size={10} />
                          </button>
                          <span className="px-6 font-black text-stone-900 text-sm tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.variantId, 1)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all duration-300 text-stone-600 shadow-sm active:scale-90"
                          >
                            <FaPlus size={10} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id, item.variantId)}
                          className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all duration-500 shadow-sm active:scale-95 group/remove"
                        >
                          <FaTrash size={14} className="group-hover/remove:rotate-12 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center space-y-6 bg-white border border-dashed border-stone-300 rounded-2xl">
                  <p className="text-stone-400 font-medium italic">Your bag is currently empty.</p>
                  <button
                    onClick={() => navigate("/")}
                    className="bg-amber-600 text-white px-8 py-3 font-black text-[10px] uppercase tracking-widest hover:bg-amber-500 transition shadow-xl"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-full">
            <div className="bg-stone-900 text-white p-8 md:p-12 flex flex-col rounded-[3rem] shadow-2xl shadow-stone-950/20 relative overflow-hidden">
              {/* Decorative Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[60px]" />

              <div className="relative z-10">
                <h3 className="text-lg font-black border-b border-white/10 pb-4 tracking-widest uppercase italic mb-8 flex justify-between items-center text-amber-500">
                  Order Summary
                  <span className="text-[10px] py-1 px-3 bg-amber-500/20 text-amber-500 rounded-full border border-amber-500/20">{cart.length} Items</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                  <div className="space-y-6">
                    <div className="flex justify-between text-stone-400 text-xs font-bold uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span className="text-white">₹{subtotal.toLocaleString()}</span>
                    </div>
                    {appliedDiscount && (
                      <div className="flex justify-between text-green-400 text-xs font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                          <span>Discount ({appliedDiscount.code})</span>
                          <button onClick={removeDiscount} className="text-[8px] bg-green-500/10 border border-green-500/20 px-2 py-0.5 hover:bg-green-500 hover:text-white transition rounded-md text-green-500 uppercase font-black">Remove</button>
                        </div>
                        <span>- ₹{discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-400 text-xs font-bold uppercase tracking-widest">
                      <span>Shipping</span>
                      <span className={appliedDiscount?.type === 'shipping' ? 'text-green-400' : 'text-white'}>
                        {appliedDiscount?.type === 'shipping' ? 'FREE' : '₹150'}
                      </span>
                    </div>
                    <div className="flex justify-between text-stone-400 text-xs font-bold uppercase tracking-widest">
                      <span>Tax (6% GST)</span>
                      <span className="text-white">₹{gstAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white/5 p-4  rounded-3xl border border-white/5">
                      <p className="text-stone-500 font-bold uppercase tracking-[0.2em] text-[10px]">Total Amount</p>
                      <p className="text-4xl font-black text-amber-500 italic tracking-tighter">₹{totalPayable.toLocaleString()}</p>
                    </div>

                    <button
                      onClick={() => navigate('/order')}
                      className="w-full bg-amber-500 text-stone-900 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-amber-400 transition-all duration-500 shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                      disabled={cart.length === 0}
                    >
                      Process Final Checkout
                      <FaArrowRight className="group-hover:translate-x-1.5 transition-transform" />
                    </button>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-3 mb-4 text-amber-500">
                      <FaLock size={14} />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">End-to-End Secure Processing</span>
                    </div>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                      Your transaction is protected by 256-bit bank-grade encryption.
                    </p>
                  </div>
                  <div className="flex gap-4 justify-start md:justify-end opacity-60">
                    <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/10 flex items-center justify-center"><FaCcVisa size={22} /></div>
                    <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/10 flex items-center justify-center"><FaCcMastercard size={22} /></div>
                    <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/10 flex items-center justify-center"><FaCcApplePay size={22} /></div>
                    <div className="bg-white/10 px-3 py-2 rounded-xl border border-white/10 flex items-center justify-center"><FaCreditCard size={22} /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
