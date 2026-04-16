import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  FaArrowRight, FaUser, FaPhone, FaLocationDot, FaCalendar, FaVenusMars, FaStopwatch, FaImage
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

export default function UserOnboarding() {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    dob: "",
    phone: "",
    otp: "",
    address: "",
    profilePicture: null
  });

  const [confirmationResult, setConfirmationResult] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
    }

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handleGetOTP = async () => {
    let formattedPhone = formData.phone.trim();
    
    // Auto-prepend +91 if user forgets
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone;
    }

    if (formattedPhone.length < 13) {
      setStatusMsg({ text: "Please enter a valid 10-digit mobile number", type: "error" });
      return;
    }

    try {
      setStatusMsg({ text: "Sending OTP...", type: "success" });
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setStatusMsg({ text: "OTP sent to your mobile via Firebase 📱", type: "success" });
    } catch (err) {
      console.error(err);
      setStatusMsg({ text: "Failed to send Firebase OTP! Check API Keys.", type: "error" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!confirmationResult && formData.otp) {
      setStatusMsg({ text: "Please request an OTP first!", type: "error" });
      return;
    }

    try {
      setStatusMsg({ text: "Verifying Profile...", type: "success" });
      // 1️⃣ Verify OTP with Firebase
      await confirmationResult.confirm(formData.otp);

      // get logged in user email
      const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

      // 2️⃣ Save onboarding data to PostgreSQL Database
      await axios.post("http://127.0.0.1:5000/onboarding", {
        email: loggedInUser.email,
        phone: formData.phone,
        name: formData.name,
        gender: formData.gender,
        dob: formData.dob,
        address: formData.address,
        profilePicture: formData.profilePicture,
      });

      // ✅ Update localStorage with new info (Excluding large image string)
      const updatedUser = { ...loggedInUser, phone: formData.phone, name: formData.name, is_verified: true };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setStatusMsg({ text: "Profile Completed ✅ Redirecting...", type: "success" });
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);

    } catch (err) {
      console.error(err);
      setStatusMsg({ text: "Invalid OTP or Something went wrong ❌", type: "error" });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profilePicture: reader.result, // Sets image URL as Base64 string encoded text
        }));
      };

      reader.readAsDataURL(file);
    }
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
        className="w-full max-w-2xl relative z-10"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200/40 p-8 md:p-12 border border-stone-50">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-stone-900 tracking-tight mb-2">Complete Profile</h1>
            <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest">Just a few more details to get started</p>
          </div>

          {statusMsg.text && (
            <motion.div
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className={`mb-8 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border ${statusMsg.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}
            >
              {statusMsg.text}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div id="recaptcha-container"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-900 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-stone-50 border-2 border-stone-50 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-amber-600/10 focus:bg-white transition-all text-sm font-semibold"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-900 uppercase tracking-widest ml-1">Mobile Number</label>
                <div className="relative group flex items-center">
                  <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors z-10" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-stone-50 border-2 border-stone-50 rounded-xl py-3 pl-12 pr-20 outline-none focus:border-amber-600/10 focus:bg-white transition-all text-sm font-semibold"
                    placeholder="+91"
                    required
                  />
                  <button type="button" onClick={handleGetOTP} className="absolute right-2 text-[9px] font-black uppercase text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors z-10">
                    Get OTP
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-900 uppercase tracking-widest ml-1">OTP Verification</label>
                <div className="relative group">
                  <FaStopwatch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors" />
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    className="w-full bg-stone-50 border-2 border-stone-50 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-amber-600/10 focus:bg-white transition-all text-sm font-semibold tracking-widest"
                    placeholder="••••••"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-900 uppercase tracking-widest ml-1">Profile Picture (Optional)</label>
                <div className="relative group flex items-center bg-stone-50 border-2 border-stone-50 rounded-xl hover:border-amber-600/20 transition-all overflow-hidden h-[52px]">
                  <FaImage className="absolute left-4 text-stone-300 group-hover:text-amber-600 transition-colors" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div className="pl-12 pr-4 text-sm font-semibold text-stone-500 w-full truncate pointer-events-none">
                    {formData.profilePicture ? "Image Selected" : "Choose file..."}
                  </div>
                  {formData.profilePicture && (
                    <img src={formData.profilePicture} alt="Profile" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 object-cover rounded-md z-0" />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-stone-900 uppercase tracking-widest ml-1">Full Address</label>
              <div className="relative group">
                <FaLocationDot className="absolute left-4 top-4 text-stone-300 group-focus-within:text-amber-600 transition-colors" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  className="w-full bg-stone-50 border-2 border-stone-50 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-amber-600/10 focus:bg-white transition-all text-sm font-semibold resize-none"
                  placeholder="Street, City, Zip Code"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-900 uppercase tracking-widest ml-1">Date of Birth</label>
                <div className="relative group">
                  <FaCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors" />
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full bg-stone-50 border-2 border-stone-50 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-amber-600/10 focus:bg-white transition-all text-sm font-semibold text-stone-600"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-900 uppercase tracking-widest ml-1">Gender</label>
                <div className="relative group">
                  <FaVenusMars className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors" />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-stone-50 border-2 border-stone-50 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-amber-600/10 focus:bg-white transition-all text-sm font-semibold appearance-none"
                    required
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other / Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-stone-900 text-white rounded-xl py-4 flex items-center justify-center gap-3 font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-stone-900/10 active:scale-[0.98] group mt-6"
            >
              Complete Registration <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
