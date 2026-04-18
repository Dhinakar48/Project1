import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FaArrowRight, FaLock, FaEnvelope, FaShopify, 
  FaArrowLeftLong, FaUser, FaPhone, FaStopwatch,
  FaLaptop, FaMobileScreen, FaHeadphones, FaCamera
} from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import axios from "axios";

export default function SellerRegister() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    otp: "",
    password: ""
  });
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  useEffect(() => {
    if (!window.sellerRecaptchaVerifier) {
      window.sellerRecaptchaVerifier = new RecaptchaVerifier(
        auth, 
        "seller-recaptcha-container",
        { size: "invisible" }
      );
    }
    return () => {
      if (window.sellerRecaptchaVerifier) {
        window.sellerRecaptchaVerifier.clear();
        window.sellerRecaptchaVerifier = null;
      }
    };
  }, []);

  const handleGetOTP = async () => {
    let formattedPhone = formData.mobile.trim();
    formattedPhone = formattedPhone.replace(/\D/g, '');

    if (formattedPhone.length === 10) {
      formattedPhone = '+91' + formattedPhone;
    } else if (formattedPhone.length === 12 && formattedPhone.startsWith('91')) {
      formattedPhone = '+' + formattedPhone;
    } else {
      setStatusMsg({ text: "Invalid phone number", type: "error" });
      return;
    }

    try {
      setStatusMsg({ text: "Sending OTP...", type: "success" });
      const appVerifier = window.sellerRecaptchaVerifier;
      if (!appVerifier) {
        setStatusMsg({ text: "Verification tool not ready. Please refresh.", type: "error" });
        return;
      }

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setStatusMsg({ text: "OTP sent to your mobile! 📱", type: "success" });
    } catch (err) {
      console.error(err);
      setStatusMsg({ text: err.message || "Failed to send OTP", type: "error" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confirmationResult) {
      setStatusMsg({ text: "Please request an OTP first", type: "error" });
      return;
    }

    try {
      setStatusMsg({ text: "Verifying credentials...", type: "success" });
      await confirmationResult.confirm(formData.otp);
      
      // ✅ Save to backend
      await axios.post("http://127.0.0.1:5000/seller-register", {
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
        phone: formData.mobile
      });
      
      setStatusMsg({ text: "Registration Successful! Redirecting...", type: "success" });
      setTimeout(() => navigate("/seller-login"), 1500);
      
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Verification failed. Check your OTP.";
      setStatusMsg({ text: errMsg, type: "error" });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Left Side: Premium Design Layer */}
      <div className="hidden md:flex md:w-[45%] lg:w-[50%] bg-stone-900 relative items-center justify-center p-20 overflow-hidden">
         <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-amber-500/10 rounded-full blur-[120px]" />
         <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
           <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[15%] left-[10%] text-white/[0.03]">
              <FaLaptop size={140} />
           </motion.div>
           <motion.div animate={{ y: [0, 30, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[10%] left-[15%] text-amber-500/[0.05]">
              <FaMobileScreen size={90} />
           </motion.div>
           <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[10%] right-[10%] text-white/[0.04]">
              <FaHeadphones size={180} />
           </motion.div>
           <motion.div animate={{ y: [0, 25, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[20%] right-[15%] text-white/[0.03]">
              <FaCamera size={120} />
           </motion.div>
         </div>

         <div className="relative z-10 flex flex-col items-center text-center">
            <motion.div
              initial={{ rotate: -10, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              className="w-32 h-32 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center text-amber-500 shadow-2xl backdrop-blur-md mb-8"
            >
              <FaShopify size={70} />
            </motion.div>
            <h2 className="text-6xl md:text-7xl font-bold text-white tracking-tight">
               Electro<span className="text-amber-500">Shop</span>
            </h2>
            <p className="text-stone-400 text-xs font-bold uppercase tracking-[0.4em] mt-6">Premium Electronics</p>
         </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center px-6 py-10 relative overflow-hidden backdrop-blur-3xl min-h-screen">
        <div id="seller-recaptcha-container"></div>
        
        <div className="absolute top-8 left-8 md:left-12">
          <Link to="/" className="flex items-center gap-3 text-stone-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-stone-900 transition-all duration-300 group font-bold">
            <FaArrowLeftLong className="group-hover:-translate-x-1.5 transition-transform duration-300" />
            <span className="hidden sm:inline">Back to Global Store</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl relative z-10"
        >
          <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] p-5 md:p-8 border border-white">
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 bg-stone-900 rounded-2xl flex items-center justify-center text-amber-500 mb-3 shadow-xl">
                <FaShopify size={28} />
              </div>
              <h1 className="text-2xl font-black text-stone-900 tracking-tight text-center">Merchant Application</h1>
              <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Initialize your business partnership</p>
            </div>

            {statusMsg.text && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`mb-5 p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border ${statusMsg.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}
              >
                {statusMsg.text}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-4">Full Name</label>
                <div className="relative group">
                  <FaUser className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-500 transition-all" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-stone-50/50 border border-stone-100 rounded-2xl py-3 pl-12 pr-6 outline-none focus:border-amber-600/30 focus:bg-white transition-all text-stone-900 text-xs font-semibold"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-4">Business Email</label>
                <div className="relative group">
                  <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-500 transition-all" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-stone-50/50 border border-stone-100 rounded-2xl py-3 pl-12 pr-6 outline-none focus:border-amber-600/30 focus:bg-white transition-all text-stone-900 text-xs font-semibold"
                    placeholder="partner@business.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-4">Mobile Number</label>
                  <div className="relative flex group items-center">
                    <FaPhone className="absolute left-5 text-stone-300 group-focus-within:text-amber-500 transition-all z-10" />
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="w-full bg-stone-50/50 border border-stone-100 rounded-2xl py-3 pl-12 pr-20 outline-none focus:border-amber-600/30 focus:bg-white transition-all text-stone-900 text-xs font-semibold"
                      placeholder="+91"
                      required
                    />
                    <button type="button" onClick={handleGetOTP} className="absolute right-2 text-[9px] font-black uppercase text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors z-10">
                      Get OTP
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-4">OTP Verification</label>
                  <div className="relative group">
                    <FaStopwatch className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-500 transition-all" />
                    <input
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      className="w-full bg-stone-50/50 border border-stone-100 rounded-2xl py-3 pl-12 pr-6 outline-none focus:border-amber-600/30 focus:bg-white transition-all text-stone-900 text-xs font-semibold tracking-[0.5em]"
                      placeholder="••••••"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-4">Secure Password</label>
                <div className="relative group">
                  <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-500 transition-all" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-stone-50/50 border border-stone-100 rounded-2xl py-3 pl-12 pr-6 outline-none focus:border-amber-600/30 focus:bg-white transition-all text-stone-900 text-xs font-semibold"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full bg-stone-900 text-amber-500 rounded-2xl py-4 flex items-center justify-center gap-4 font-black uppercase tracking-[0.15em] text-xs hover:bg-stone-800 transition-all duration-300 group shadow-xl active:scale-[0.99]"
                >
                  <span>Request Authorization</span>
                  <FaArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>
            </form>

            <div className="mt-6 border-t border-stone-50 text-center">
              <p className="text-stone-400 text-[11px] font-bold">
                Active Partnership?{" "}
                <Link to="/seller-login" className="text-stone-900 hover:text-amber-600 transition-colors underline underline-offset-4 font-black uppercase tracking-widest text-[9px]">
                  Sign In 
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
