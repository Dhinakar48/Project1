import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "./StoreContext";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaMinus, FaPlus, FaArrowLeft } from "react-icons/fa6";

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="popLayout">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <motion.div
                    key={`${item.id}-${item.variantId}`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col sm:flex-row gap-6 p-6 bg-white border border-stone-200 transition group relative overflow-hidden"
                  >
                    <div className="w-full sm:w-40 h-40 bg-stone-100 flex-shrink-0 overflow-hidden">
                      <img
                        src={item.variant.img}
                        alt={item.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition duration-700 p-4"
                      />
                    </div>

                    <div className="flex-grow space-y-2 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">{item.title}</p>
                            <h2 className="text-xl font-bold tracking-tight">{item.name}</h2>
                          </div>
                          <p className="text-lg font-black text-amber-600">{item.variant.price}</p>
                        </div>
                        <p className="text-sm text-stone-500 font-medium">Color: {item.variant.colorName}</p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-stone-200 bg-stone-50 rounded-full overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.variantId, -1)}
                            className="p-3 hover:bg-stone-200 transition text-stone-600"
                          >
                            <FaMinus size={12} />
                          </button>
                          <span className="px-5 font-bold text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.variantId, 1)}
                            className="p-3 hover:bg-stone-200 transition text-stone-600"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id, item.variantId)}
                          className="flex items-center gap-2 text-stone-400 hover:text-red-500 transition text-xs font-bold uppercase tracking-widest"
                        >
                          <FaTrash size={12} />
                          <span>Remove</span>
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

          <div className="lg:col-span-1">
            <div className="bg-amber-500 text-black p-8 sticky top-32 space-y-8 rounded-2xl shadow-2xl shadow-amber-900/20">
              <h3 className="text-xl font-bold border-b border-amber-500/30 pb-4 tracking-tight uppercase italic">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-stone-400 text-sm">
                  <span className="text-black">Subtotal</span>
                  <span className="text-black">₹{subtotal.toLocaleString()}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-green-400 text-sm">
                    <div className="flex items-center gap-2">
                       <span>Discount ({appliedDiscount.code})</span>
                       <button onClick={removeDiscount} className="text-[8px] border border-green-900 px-1 hover:bg-green-900 transition mt-0.5">REMOVE</button>
                    </div>
                    <span>- ₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-400 text-sm">
                  <span className="text-black">Shipping</span>
                  <span className={appliedDiscount?.type === 'shipping' ? 'text-green-500 font-bold' : 'text-black'}>
                    {appliedDiscount?.type === 'shipping' ? 'FREE' : '₹500'}
                  </span>
                </div>
                <div className="flex justify-between text-stone-400 text-sm">
                  <span className="text-black">Tax</span>
                  <span className="text-black">₹0.00</span>
                </div>
              </div>

              <div className="border-t border-amber-500/30 pt-6 flex justify-between items-end">
                <p className="text-black font-black uppercase tracking-widest text-[10px]">Total Amount</p>
                <p className="text-3xl font-black">₹{(finalTotal + (appliedDiscount?.type === 'shipping' ? 0 : 500)).toLocaleString()}</p>
              </div>

              <button className="w-full bg-white text-amber-600 py-4 font-black uppercase tracking-widest hover:bg-amber-50 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl" disabled={cart.length === 0}>
                Checkout Now
              </button>
              
              <p className="text-[10px] text-white uppercase tracking-widest text-center">Secure checkout powered by ElectroShop</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
