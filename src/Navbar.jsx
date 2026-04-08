import { useState, useEffect } from "react";
import { FaOpencart, FaUser } from "react-icons/fa6";
import { FaBars, FaTimes, FaSearch } from "react-icons/fa";
import { PiHeartStraight } from "react-icons/pi";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "./StoreContext";
import { Link, useNavigate } from "react-router-dom";

const offers = [
  "🔥 Get 20% off all Bose Buds Pro - Limited Time!",
  "🚚 Free 2-Day Shipping on the new Vertex Pro 16",
  "⌚ Bundle a Pulse Watch X with any Audio product for 15% off"
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(0);
  const { cart, wishlist } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentOffer((prev) => (prev === offers.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="bg-stone-900 text-stone-50 py-2 px-4 text-xs sm:text-sm font-medium flex items-center justify-center relative overflow-hidden h-9 md:h-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentOffer}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute tracking-wide"
          >
            {offers[currentOffer]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="bg-stone-100/90 backdrop-blur-md text-stone-900 border-b border-stone-200 p-2 sticky top-0 z-50">

        <div className="flex justify-between items-center p-1 px-1 max-w-7xl mx-auto">

          <Link to="/" className="text-xl font-bold tracking-tight text-stone-800">ElectroShop</Link>

          <div className="hidden md:flex gap-8 items-center">
            <p className="text-stone-600 hover:text-stone-900 font-medium cursor-pointer transition">Audio</p>
            <p className="text-stone-600 hover:text-stone-900 font-medium cursor-pointer transition">Wearables</p>
            <p className="text-stone-600 hover:text-stone-900 font-medium cursor-pointer transition">Computing</p>
            <p className="text-stone-600 hover:text-stone-900 font-medium cursor-pointer transition">Accessories</p>
          </div>

          <div className="hidden md:flex gap-5 xl:gap-6 items-center text-stone-600">
            <div className="flex items-center bg-stone-200/50 rounded-full px-3 py-1.5 focus-within:bg-stone-200 transition-colors border border-transparent focus-within:border-stone-300">
              <FaSearch className="text-stone-500 mr-2 text-sm" />
              <input type="text" placeholder="Search..." className="bg-transparent outline-none text-sm w-24 lg:w-32 focus:w-48 sm:focus:w-48 transition-all duration-300 placeholder-stone-500 text-stone-900" />
            </div>
            
            <Link to="/wishlist" className="relative hover:text-stone-900 cursor-pointer transition">
              <PiHeartStraight size={22} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-stone-900 text-stone-50 text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative hover:text-stone-900 cursor-pointer transition">
              <FaOpencart size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-stone-900 text-stone-50 text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </Link>

            <FaUser size={18} className="hover:text-stone-900 cursor-pointer transition" />
          </div>

          <div className="md:hidden text-stone-600">
            {open ? (
              <FaTimes size={22} onClick={() => setOpen(false)} className="cursor-pointer" />
            ) : (
              <FaBars size={22} onClick={() => setOpen(true)} className="cursor-pointer" />
            )}
          </div>
        </div>

        {open && (
          <div className="md:hidden mt-4 flex flex-col gap-4 px-4 bg-stone-100 shadow-lg pb-6 pt-4 rounded-b-2xl absolute left-0 right-0 z-50 border-t border-stone-200">
            <div className="flex items-center bg-stone-200 rounded-full px-4 py-2.5 mb-2">
              <FaSearch className="text-stone-500 mr-3" />
              <input type="text" placeholder="Search products..." className="bg-transparent outline-none w-full text-stone-900 placeholder-stone-500" />
            </div>
            <p className="border-b border-stone-200 pb-2 text-stone-700 font-medium">Audio</p>
            <p className="border-b border-stone-200 pb-2 text-stone-700 font-medium">Wearables</p>
            <p className="border-b border-stone-200 pb-2 text-stone-700 font-medium">Computing</p>
            <p className="border-b border-stone-200 pb-2 text-stone-700 font-medium">Accessories</p>

            <div className="flex gap-6 pt-4 text-stone-700">
              <Link to="/wishlist" onClick={() => setOpen(false)} className="relative">
                <PiHeartStraight size={20} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-stone-900 text-stone-50 text-[10px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <Link to="/cart" onClick={() => setOpen(false)} className="relative">
                <FaOpencart size={24} />
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-stone-900 text-stone-50 text-[10px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </Link>
              <FaUser size={20} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}