import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaLock, FaEnvelope, FaShopify, FaArrowLeftLong, FaLaptop, FaMobileScreen, FaHeadphones, FaCamera, FaStopwatch } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function SellerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('isSellerAuthenticated') === 'true') {
      navigate('/seller-dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://127.0.0.1:5000/seller-login", { email, password });
      const { seller } = res.data;

      // Check default admin as well just in case
      if (email === "electroshop@gmail.com" && password === "3616") {
         localStorage.setItem('sellerActiveTab', 'Overview');
         localStorage.setItem('isSellerAuthenticated', 'true');
         localStorage.setItem('user', JSON.stringify({ email, name: "Admin Seller" })); // for global tracking
         navigate("/seller-dashboard", { replace: true });
         return;
      }

      if (seller) {
        localStorage.setItem('sellerUser', JSON.stringify(seller));
        
        if (seller.isVerified) {
          localStorage.setItem('sellerActiveTab', 'Overview');
          localStorage.setItem('isSellerAuthenticated', 'true');
          navigate("/seller-dashboard", { replace: true });
        } else {
          // Needs onboarding
          localStorage.setItem('onboardingSellerEmail', email);
          navigate("/seller-onboarding");
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid corporate credentials. Access denied.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Left Side: Premium Design Layer */}
      <div className="hidden md:flex md:w-[45%] lg:w-[50%] bg-stone-900 relative items-center justify-center p-20 overflow-hidden">
         {/* Abstract geometric decor */}
         <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-amber-500/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-stone-800 rounded-full blur-[100px]" />
         
         {/* Floating Electronic Items */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
           <motion.div animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[15%] left-[10%] text-white/[0.03]">
              <FaLaptop size={140} />
           </motion.div>
           <motion.div animate={{ y: [0, 30, 0], x: [0, 10, 0], rotate: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-[10%] left-[15%] text-amber-500/[0.05]">
              <FaMobileScreen size={90} />
           </motion.div>
           <motion.div animate={{ y: [0, -15, 0], x: [0, -15, 0], rotate: [0, 15, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute top-[10%] right-[10%] text-white/[0.04]">
              <FaHeadphones size={180} />
           </motion.div>
           <motion.div animate={{ y: [0, 25, 0], rotate: [0, -5, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute bottom-[20%] right-[15%] text-white/[0.03]">
              <FaCamera size={120} />
           </motion.div>
           <motion.div animate={{ y: [0, -20, 0], x: [0, 20, 0], rotate: [0, 10, 0] }} transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} className="absolute top-[45%] left-[50%] translate-x-[-50%] text-amber-500/[0.04]">
              <FaStopwatch size={100} />
           </motion.div>
         </div>
         
         <div className="relative z-10 flex flex-col items-center text-center">
            <motion.div
              initial={{ rotate: -10, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="w-32 h-32 bg-white/5 border border-white/10 rounded-[3xl] flex items-center justify-center text-amber-500 shadow-2xl backdrop-blur-md mb-8"
            >
              <FaShopify size={70} />
            </motion.div>
            
            <motion.h2 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="text-6xl md:text-7xl font-bold text-white tracking-tight mix-blend-lighten"
            >
               Electro<span className="text-amber-500">Shop</span>
            </motion.h2>

            <motion.p
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 1, delay: 0.4 }}
               className="text-stone-400 text-xs font-bold uppercase tracking-[0.4em] mt-6 backdrop-blur-sm"
            >
               Premium Electronics
            </motion.p>
         </div>

         {/* Cyber Circuit Overlay */}
         <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
              style={{ backgroundImage: 'radial-gradient(#f59e0b 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="flex-1 bg-white flex flex-col justify-center items-center px-6 py-10   relative overflow-hidden backdrop-blur-3xl">
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
          className="w-full max-w-lg relative z-10"
        >
          <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] p-6 md:p-10 border border-white">
            <div className="flex flex-col items-center mb-5">
              <motion.div 
                initial={{ rotate: -10, opacity: 0 }}
                animate={{ rotate: 3, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="w-19 h-19 bg-stone-900 rounded-[2rem] flex items-center justify-center text-amber-500 shadow-2xl shadow-stone-950/20 mb-6"
              >
                <FaShopify size={40} />
              </motion.div>
              <h1 className="text-4xl font-black text-stone-900 tracking-tight text-center mb-3">
                Seller Portal
              </h1>
              <p className="text-stone-400 text-sm font-bold uppercase tracking-[0.2em] text-center">
                ElectroShop Executive Login
              </p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-600 p-2 rounded-2xl text-xs font-black uppercase tracking-widest text-center mb-6"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-4">
                  Corporate Email
                </label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors duration-300">
                    <FaEnvelope size={16} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50/50 border border-stone-100 rounded-3xl py-5 pl-14 pr-6 outline-none focus:border-amber-600/30 focus:ring-2 focus:ring-amber-500/10 transition-all duration-300 text-stone-900 font-semibold"
                    placeholder="name@electroshop.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-4">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                    Secure Password
                  </label>
                  <a href="#" className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:text-amber-700 transition-colors">
                    Recovery
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors duration-300">
                    <FaLock size={16} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-stone-50/50 border border-stone-100 rounded-3xl py-5 pl-14 pr-6 outline-none focus:border-amber-600/30 focus:ring-2 focus:ring-amber-500/5 transition-all duration-300 text-stone-900 font-semibold"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-stone-900 text-amber-500 rounded-3xl py-5 flex items-center justify-center gap-4 font-black uppercase tracking-[0.15em] hover:bg-stone-800 transition-all duration-300 group shadow-2xl shadow-stone-900/20 active:scale-[0.99]"
              >
                <span>Initialize Session</span>
                <FaArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
              </button>
            </form>

            <div className="mt-1 pt-7 border-t border-stone-50 text-center">
              <p className="text-stone-400 text-xs font-bold tracking-wide">
                New Partnership?{" "}
                <Link to="/seller-register" className="text-stone-900 hover:text-amber-600 transition-colors underline underline-offset-4 decoration-stone-200">
                  Register as Seller
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
