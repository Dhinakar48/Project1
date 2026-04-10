import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FaArrowRight, FaLock, FaEnvelope, FaShopify, 
  FaArrowLeftLong, FaUser, FaStore, FaBriefcase 
} from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";

export default function SellerRegister() {
  const [formData, setFormData] = useState({
    shopName: "",
    ownerName: "",
    email: "",
    password: "",
    businessType: "Electronics"
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Seller registration data:", formData);
    navigate("/seller-login");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Left Side: Premium Design Layer (Shared with Login) */}
      <div className="hidden md:flex md:w-[45%] lg:w-[50%] bg-stone-900 relative items-center justify-center p-20 overflow-hidden">
         {/* Abstract geometric decor */}
         <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-amber-500/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-stone-800 rounded-full blur-[100px]" />
         
         <div className="relative z-10 space-y-8 max-w-md">
            <motion.div
               initial={{ opacity: 0, x: -50 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8 }}
               className="inline-block px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full"
            >
               <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Partnership Program</span>
            </motion.div>
            
            <motion.h2 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="text-6xl font-black text-white italic leading-none tracking-tighter"
            >
               EXPAND YOUR <br />
               <span className="text-amber-500">HORIZONS</span> <br />
               GLOBALLY.
            </motion.h2>
            
            <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 1, delay: 0.4 }}
               className="text-stone-400 text-sm font-medium leading-relaxed"
            >
               Join the world's most innovative seller network. Our platform provides the tools, 
               audience, and infrastructure to turn your local business into a global logistics powerhouse.
            </motion.p>

            <div className="pt-10 flex gap-12 border-t border-stone-800">
               <div>
                  <span className="block text-2xl font-black text-white italic">0%</span>
                  <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Listing Fees</span>
               </div>
               <div>
                  <span className="block text-2xl font-black text-white italic">24/7</span>
                  <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Support Core</span>
               </div>
            </div>
         </div>

         {/* Cyber Circuit Overlay */}
         <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
              style={{ backgroundImage: 'radial-gradient(#f59e0b 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Right Side: Registration Form */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center px-6 py-10 relative overflow-hidden backdrop-blur-3xl min-h-screen">
        {/* Navigation Layer */}
        <div className="absolute top-8 left-8 md:left-12">
          <Link to="/" className="flex items-center gap-3 text-stone-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-stone-900 transition-all duration-300 group">
            <FaArrowLeftLong className="group-hover:-translate-x-1.5 transition-transform duration-300" />
            <span className="hidden sm:inline">Back to Global Store</span>
          </Link>
        </div>

        {/* Background Decor */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-amber-50 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-stone-50 rounded-full blur-[120px] opacity-60" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-xl relative z-10"
        >
          <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] p-6 md:p-10 border border-white">
            <div className="flex flex-col items-center mb-8">
              <motion.div 
                initial={{ rotate: -10, opacity: 0 }}
                animate={{ rotate: 3, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center text-amber-500 shadow-2xl shadow-stone-950/20 mb-6"
              >
                <FaShopify size={32} />
              </motion.div>
              <h1 className="text-3xl font-black text-stone-900 tracking-tight text-center mb-2">
                Merchant Application
              </h1>
              <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em] text-center">
                Initialize your business partnership
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-4">Shop Name</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-500 transition-all">
                      <FaStore size={14} />
                    </div>
                    <input
                      type="text"
                      name="shopName"
                      value={formData.shopName}
                      onChange={handleChange}
                      className="w-full bg-stone-50/50 border border-stone-100 rounded-2xl py-3.5 pl-12 pr-6 outline-none focus:border-amber-600/30 focus:bg-white transition-all text-stone-900 text-xs font-semibold"
                      placeholder="e.g. Pixel Perfect"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-4">Full Name</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-500 transition-all">
                      <FaUser size={14} />
                    </div>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      className="w-full bg-stone-50/50 border border-stone-100 rounded-2xl py-3.5 pl-12 pr-6 outline-none focus:border-amber-600/30 focus:bg-white transition-all text-stone-900 text-xs font-semibold"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-4">Business Email</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-500 transition-all">
                    <FaEnvelope size={14} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-stone-50/50 border border-stone-100 rounded-2xl py-3.5 pl-12 pr-6 outline-none focus:border-amber-600/30 focus:bg-white transition-all text-stone-900 text-xs font-semibold"
                    placeholder="partner@business.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-4">Niche Sector</label>
                   <div className="relative group">
                     <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-500 transition-all pointer-events-none">
                       <FaBriefcase size={14} />
                     </div>
                     <select
                       name="businessType"
                       value={formData.businessType}
                       onChange={handleChange}
                       className="w-full bg-stone-50/50 border border-stone-100 rounded-2xl py-3.5 pl-12 pr-6 outline-none focus:border-amber-600/30 focus:bg-white transition-all text-stone-900 text-xs font-semibold appearance-none"
                     >
                       <option value="Electronics">Electronics</option>
                       <option value="Accessories">Accessories</option>
                       <option value="Computing">Computing</option>
                       <option value="Wearables">Wearables</option>
                     </select>
                   </div>
                 </div>

                 <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-4">Secure Password</label>
                   <div className="relative group">
                     <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-500 transition-all">
                       <FaLock size={14} />
                     </div>
                     <input
                       type="password"
                       name="password"
                       value={formData.password}
                       onChange={handleChange}
                       className="w-full bg-stone-50/50 border border-stone-100 rounded-2xl py-3.5 pl-12 pr-6 outline-none focus:border-amber-600/30 focus:bg-white transition-all text-stone-900 text-xs font-semibold"
                       placeholder="••••••••"
                       required
                     />
                   </div>
                 </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-stone-900 text-amber-500 rounded-2xl py-5 flex items-center justify-center gap-4 font-black uppercase tracking-[0.15em] text-xs hover:bg-stone-800 transition-all duration-300 group shadow-2xl shadow-stone-900/10 active:scale-[0.99]"
                >
                  <span>Request Authorization</span>
                  <FaArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-stone-50 text-center">
              <p className="text-stone-400 text-[10px] font-bold tracking-wide uppercase">
                Active Partnership?{" "}
                <Link to="/seller-login" className="text-stone-900 hover:text-amber-600 transition-colors underline underline-offset-4 decoration-stone-200">
                  Authenticate Terminal
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
