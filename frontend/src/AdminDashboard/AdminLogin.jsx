import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserShield, FaLock, FaEnvelope } from "react-icons/fa";
import axios from "axios";

export default function AdminLogin() {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [error, setError] = useState("");
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

   const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      try {
         const res = await axios.post("http://localhost:5000/admin-login", { email, password });
         
         if (res.data.success) {
            // Save admin token/details
            localStorage.setItem("admin", JSON.stringify(res.data.admin));
            localStorage.setItem("adminActiveTab", "overview");
            
            setTimeout(() => {
               navigate("/admin");
            }, 500);
         } else {
            setError(res.data.message || "Invalid administrator credentials.");
         }
      } catch (err) {
         setError("Connection to authorization server failed.");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
         {/* Background Elements */}
         <div className="absolute inset-0 z-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
         </div>

         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-md bg-stone-900/80 backdrop-blur-xl border border-stone-800 rounded-3xl shadow-2xl relative z-10 overflow-hidden"
         >
            <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
            
            <div className="p-8 md:p-10">
               <div className="flex flex-col items-center mb-10">
                  <div className="w-16 h-16 bg-stone-800 border border-stone-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/10">
                     <FaUserShield className="text-3xl text-indigo-400" />
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Admin<span className="text-indigo-400">Core</span> Authentication</h1>
                  <p className="text-stone-400 text-sm mt-2">Restricted Area. Authorized Personnel Only.</p>
               </div>

               {error && (
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold p-4 rounded-xl mb-6 text-center"
                  >
                     {error}
                  </motion.div>
               )}

               <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                     <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Admin Email</label>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                           <FaEnvelope className="text-stone-500" />
                        </div>
                        <input
                           type="email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className="w-full bg-stone-800/50 border border-stone-700 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                           placeholder="Enter registered email"
                           required
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">Access Passcode</label>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                           <FaLock className="text-stone-500" />
                        </div>
                        <input
                           type="password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="w-full bg-stone-800/50 border border-stone-700 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                           placeholder="Enter highly secure passcode"
                           required
                        />
                     </div>
                  </div>

                  <button
                     type="submit"
                     disabled={loading}
                     className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                  >
                     {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     ) : (
                        "Initiate Secure Login"
                     )}
                  </button>
               </form>
            </div>
         </motion.div>
      </div>
   );
}
