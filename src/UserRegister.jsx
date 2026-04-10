import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaLock, FaEnvelope, FaUser, FaArrowLeftLong } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";

export default function UserRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Customer registration:", formData);
    // Simulate registration by logging them in
    localStorage.setItem("user", JSON.stringify({ email: formData.email, name: formData.name }));
    navigate("/");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[45%] bg-amber-50 rounded-full blur-[110px] opacity-50" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[45%] h-[45%] bg-stone-50 rounded-full blur-[110px] opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200/40 p-10 md:p-14 border border-stone-50">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-stone-900 tracking-tight mb-2 uppercase italic">Join ElectroShop</h1>
            <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest">Create your personal shopping account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-900 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-amber-600/10 focus:bg-white transition-all text-sm font-semibold"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-900 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-amber-600/10 focus:bg-white transition-all text-sm font-semibold"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-900 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-amber-600/10 focus:bg-white transition-all text-sm font-semibold"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-stone-900 text-white rounded-2xl py-4 flex items-center justify-center gap-3 font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-stone-900/10 active:scale-[0.98] group mt-4"
            >
              Create Account <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="text-center mt-10 text-stone-400 text-xs font-bold uppercase tracking-wide">
            Already have an account?{" "}
            <Link to="/login" className="text-stone-900 hover:text-amber-600 underline underline-offset-4 transition-colors">Sign In</Link>
          </p>
        </div>

        <Link to="/" className="mt-10 flex items-center justify-center gap-3 text-stone-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-stone-900 transition-colors group">
          <FaArrowLeftLong className="group-hover:-translate-x-2 transition-transform" /> Back to Storefront
        </Link>
      </motion.div>
    </div>
  );
}
