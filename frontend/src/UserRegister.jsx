import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaLock, FaEnvelope, FaArrowLeftLong } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";


export default function UserRegister() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:5000/register", {
        email: formData.email,
        password: formData.password,
      });

      alert("Registration successful!");
      navigate("/login");

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };



  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
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
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200/40 p-10 md:p-14 border border-stone-100">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-2">Join ElectroShop</h1>
            <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest">Create your personal access account</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center mb-6 border border-red-100"
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
                  minLength={6}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-900 uppercase tracking-widest ml-1">Re-enter Password</label>
              <div className="relative group">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-amber-600/10 focus:bg-white transition-all text-sm font-semibold"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-stone-900 text-white rounded-2xl py-4 flex items-center justify-center gap-3 font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-stone-900/10 active:scale-[0.98] group mt-4"
            >
              Start Registration <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
