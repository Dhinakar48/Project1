import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaLock, FaEnvelope, FaFacebookF, FaGoogle, FaArrowLeftLong } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { useStore } from "./StoreContext";

export default function Login() {
  const { setUserProfile } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://127.0.0.1:5000/login", {
        email,
        password,
      });

      const user = res.data.user;

      const { profilePicture, ...safeUser } = user;
      localStorage.setItem("user", JSON.stringify(safeUser));
      setUserProfile({
        name: user.name,
        email: user.email,
        phone: user.phone,
        is_verified: user.is_verified,
        image: user.profilePicture
      });

      // ✅ check onboarding
      if (user.is_verified) {
        navigate("/");
      } else {
        navigate("/user-onboarding");
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed - Server might be down");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-amber-100 rounded-full blur-[100px] opacity-40" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-amber-50 rounded-full blur-[100px] opacity-40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200/50 p-8 md:p-12 border border-stone-100">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-2">Welcome Back</h1>
            <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest">Access your premium electronics experience</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border border-red-100"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-900 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-amber-600/10 focus:bg-white transition-all text-sm font-semibold"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-stone-900 uppercase tracking-widest">Password</label>
                <a href="#" className="text-[10px] font-black text-amber-600 hover:underline uppercase tracking-widest">Forgot?</a>
              </div>
              <div className="relative group">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-amber-600/10 focus:bg-white transition-all text-sm font-semibold"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-stone-900 text-white rounded-2xl py-4 flex items-center justify-center gap-3 font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-stone-900/10 active:scale-[0.98] group"
            >
              Sign In <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-[1px] bg-stone-100" />
              <span className="text-[10px] text-stone-300 font-black uppercase tracking-widest">Or Continue With</span>
              <div className="flex-1 h-[1px] bg-stone-100" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 border border-stone-100 py-3 rounded-xl hover:bg-stone-50 transition-colors">
                <FaGoogle className="text-red-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 border border-stone-100 py-3 rounded-xl hover:bg-stone-50 transition-colors">
                <FaFacebookF className="text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-widest">Facebook</span>
              </button>
            </div>
          </div>

          <p className="text-center mt-10 text-stone-400 text-xs font-bold uppercase tracking-wide">
            Don't have an account?{" "}
            <Link to="/signup" className="text-stone-900 hover:text-amber-600 underline underline-offset-4 transition-colors">Sign Up</Link>
          </p>
        </div>

        <Link to="/" className="mt-10 flex items-center justify-center gap-3 text-stone-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-stone-900 transition-colors group">
          <FaArrowLeftLong className="group-hover:-translate-x-2 transition-transform" /> Back to Storefront
        </Link>
      </motion.div>
    </div>
  );
}
