import React from "react";
import { motion } from "framer-motion";
import { FaShopify, FaUserShield, FaArrowRight, FaArrowLeftLong } from "react-icons/fa6";
import { Link } from "react-router-dom";

export default function PortalSelection() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4 py-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-amber-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-stone-50 rounded-full blur-[120px] opacity-60" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tight mb-4 uppercase italic">
            Select Your Portal
          </h1>
          <p className="text-stone-400 font-bold uppercase tracking-[0.3em] text-sm">
            Choose your administrative access level
          </p>
        </div>

        <div className="flex justify-center">
          {/* Seller Portal Card */}
          <Link to="/seller-login" className="group w-full max-w-md">
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white border border-stone-100 p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-stone-200/50 flex flex-col items-center text-center transition-all group-hover:border-amber-500/30"
            >
              <div className="w-20 h-20 bg-stone-900 rounded-3xl flex items-center justify-center text-amber-500 mb-8 shadow-2xl shadow-stone-900/20 group-hover:bg-amber-500 group-hover:text-stone-900 transition-colors duration-500">
                <FaShopify size={36} />
              </div>
              <h2 className="text-2xl font-black text-stone-900 mb-3 underline decoration-amber-500/30 underline-offset-8">Seller Portal</h2>
              <p className="text-stone-400 text-sm font-medium leading-relaxed mb-8">
                Manage your store products, track orders, and monitor your sales performance in real-time.
              </p>
              <div className="flex items-center gap-2 text-stone-900 font-black uppercase tracking-widest text-xs group-hover:text-amber-600 transition-colors">
                Continue as Seller <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <Link to="/" className="text-stone-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-stone-900 transition-all duration-300 flex items-center justify-center gap-3 group">
            <FaArrowLeftLong className="group-hover:-translate-x-2 transition-transform duration-300" />
            Back to Global Storefront
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
