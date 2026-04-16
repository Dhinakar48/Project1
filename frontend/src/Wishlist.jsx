import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "./StoreContext";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaArrowLeft, FaHeart } from "react-icons/fa6";

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useStore();
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

        <div className="flex items-center gap-4 mb-12">
          <FaHeart className="text-stone-900 text-2xl md:text-4xl" />
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter">My Wishlist</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          <AnimatePresence mode="popLayout">
            {wishlist.length > 0 ? (
              wishlist.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-stone-200 group relative overflow-hidden flex flex-col"
                >
                  <div
                    className="h-72 overflow-hidden bg-stone-100 p-8 cursor-pointer relative"
                    onClick={() => navigate(`/product/${item.id}`)}
                  >
                    <img
                      src={item.variants[0].img}
                      alt={item.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition duration-1000"
                    />
                    <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/5 transition-colors duration-500"></div>
                  </div>

                  <div className="p-6 space-y-4 flex-grow flex flex-col">
                    <div>
                      <p className="text-stone-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{item.title}</p>
                      <h2 className="text-xl font-bold tracking-tight mb-2 group-hover:text-stone-600 transition">{item.name}</h2>
                      <p className="text-lg font-black text-stone-900">{item.variants[0].price}</p>
                    </div>

                    <div className="pt-4 flex gap-3 mt-auto">
                      <button
                        onClick={() => navigate(`/product/${item.id}`)}
                        className="flex-grow bg-amber-600 text-white rounded-2xl py-3 text-xs font-black uppercase tracking-widest hover:bg-amber-500 transition shadow-lg shadow-amber-600/20"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => toggleWishlist(item)}
                        className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all duration-500 shadow-sm active:scale-95 group/remove"
                      >
                        <FaTrash size={14} className="group-hover/remove:rotate-12 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center space-y-6">
                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-200">
                  <FaHeart className="text-stone-300 text-3xl" />
                </div>
                <p className="text-stone-400 font-medium text-lg tracking-wide">Your wishlist is looking lonely.</p>
                <button
                  onClick={() => navigate("/")}
                  className="bg-amber-600 text-white px-10 py-4 font-black uppercase tracking-widest hover:bg-amber-500 transition shadow-2xl shadow-amber-600/30"
                >
                  Find Something You Love
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
