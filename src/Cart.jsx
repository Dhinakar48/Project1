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
    <div className="min-h-screen bg-stone-50 text-stone-900 py-12 px-6 md:px-16 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition mb-10 group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition" />
          <span className="font-medium tracking-wide">Back to Store</span>
        </button>

        <h1 className="text-4xl md:text-6xl font-black mb-12 tracking-tighter">Shopping Bag</h1>

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
                    className="flex flex-col sm:flex-row gap-6 p-6 bg-white border border-stone-200 shadow-sm hover:shadow-md transition group relative overflow-hidden"
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
                          <p className="text-lg font-black text-stone-900">{item.variant.price}</p>
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
                    className="bg-stone-900 text-stone-50 px-8 py-3 font-bold hover:bg-stone-800 transition shadow-lg"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Summary Box */}
          <div className="lg:col-span-1">
            <div className="bg-stone-900 text-stone-50 p-8 shadow-2xl sticky top-32 space-y-8">
              <h3 className="text-xl font-bold border-b border-stone-800 pb-4 tracking-tight">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-stone-400 text-sm">
                  <span>Subtotal</span>
                  <span className="text-stone-50">₹{subtotal.toLocaleString()}</span>
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
                  <span>Shipping</span>
                  <span className={appliedDiscount?.type === 'shipping' ? 'text-green-400 font-bold' : 'text-stone-50'}>
                    {appliedDiscount?.type === 'shipping' ? 'FREE' : '₹500'}
                  </span>
                </div>
                <div className="flex justify-between text-stone-400 text-sm">
                  <span>Tax</span>
                  <span className="text-stone-50">₹0.00</span>
                </div>
              </div>

              <div className="border-t border-stone-800 pt-6 flex justify-between items-end">
                <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Total Amount</p>
                <p className="text-3xl font-black">₹{(finalTotal + (appliedDiscount?.type === 'shipping' ? 0 : 500)).toLocaleString()}</p>
              </div>

              <button className="w-full bg-stone-50 text-stone-900 py-4 font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 active:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" disabled={cart.length === 0}>
                Checkout Now
              </button>
              
              <p className="text-[10px] text-stone-500 uppercase tracking-widest text-center">Secure checkout powered by ElectroShop</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
