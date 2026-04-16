import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaShieldAlt, FaUserEdit, FaBell, FaStore, FaLock, FaTrashAlt } from "react-icons/fa";

export default function Settings() {
   const [twoStepAuth, setTwoStepAuth] = useState(false);
   const [notifications, setNotifications] = useState({
      email: true,
      orders: true,
      security: true,
      marketing: false,
      system: true
   });

   return (
      <div className="space-y-10 animate-in fade-in zoom-in-95 duration-1000">
         <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-4">
            <div className="space-y-2">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900 text-stone-100">
                  <FaShieldAlt size={10} className="text-amber-500" />
                  <span className="text-[9px] font-semibold text-amber-500">System Configuration</span>
               </div>
               <h1 className="text-4xl font-semibold text-stone-900">
                  Settings Protocol
               </h1>
            </div>
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* 1. Executive Profile */}
            <motion.div
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
               className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-stone-100 relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none transition-colors duration-700" />
               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400 shadow-sm">
                        <FaUserEdit size={20} />
                     </div>
                     <div>
                        <h3 className="font-semibold text-stone-900 text-sm">Executive Profile</h3>
                        <p className="text-[9px] font-bold text-stone-400 mt-0.5">Manage operator identity</p>
                     </div>
                  </div>

                  <div className="space-y-6 flex-1">
                     <div className="space-y-1.5 flex flex-col">
                        <label className="text-[9px] font-semibold text-stone-500 ml-1">Display Name</label>
                        <input type="text" className="w-full bg-stone-50/50 hover:bg-stone-50 border border-stone-100 focus:border-amber-500/50 outline-none rounded-xl p-4 text-sm font-bold text-stone-900 transition-all focus:shadow-[0_0_15px_rgba(245,158,11,0.1)]" placeholder="Dhinakar" />
                     </div>
                     <div className="space-y-1.5 flex flex-col">
                        <label className="text-[9px] font-semibold text-stone-500 ml-1">Email</label>
                        <input type="email" className="w-full bg-stone-50/50 hover:bg-stone-50 border border-stone-100 focus:border-amber-500/50 outline-none rounded-xl p-4 text-sm font-bold text-stone-900 transition-all focus:shadow-[0_0_15px_rgba(245,158,11,0.1)]" placeholder="director@electroseller.com" />
                     </div>
                     <div className="space-y-1.5 flex flex-col">
                        <label className="text-[9px] font-semibold text-stone-500 ml-1">Mobile</label>
                        <input type="tel" className="w-full bg-stone-50/50 hover:bg-stone-50 border border-stone-100 focus:border-amber-500/50 outline-none rounded-xl p-4 text-sm font-bold text-stone-900 transition-all focus:shadow-[0_0_15px_rgba(245,158,11,0.1)]" placeholder="+91 98765 43210" />
                     </div>
                  </div>
                  <div className="mt-8">
                     <button className="w-full sm:w-auto bg-stone-900 text-white px-8 py-4 rounded-xl font-semibold text-[10px] hover:bg-amber-500 hover:text-stone-900 transition-all shadow-lg shadow-stone-900/10 active:scale-95">Save Profile</button>
                  </div>
               </div>
            </motion.div>

            {/* 2. Access Security */}
            <motion.div
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
               className="bg-stone-900 p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none transition-colors duration-700" />
               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-500 shadow-inner">
                        <FaLock size={18} />
                     </div>
                     <div>
                        <h3 className="font-semibold text-white text-sm">Core Security</h3>
                        <p className="text-[9px] font-bold text-stone-400 mt-0.5">Encryption architectures</p>
                     </div>
                  </div>

                  <div className="space-y-6 flex-1">
                     <div className="space-y-1.5 flex flex-col">
                        <label className="text-[9px] font-semibold text-stone-400 ml-1">Current Password</label>
                        <input type="password" placeholder="••••••••" className="w-full bg-stone-800/50 hover:bg-stone-800 border border-stone-700 focus:border-amber-500/50 outline-none rounded-xl p-4 text-sm font-bold text-white transition-all placeholder-stone-600" />
                     </div>
                     <div className="space-y-1.5 flex flex-col">
                        <label className="text-[9px] font-semibold text-stone-400 ml-1">New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full bg-stone-800/50 hover:bg-stone-800 border border-stone-700 focus:border-amber-500/50 outline-none rounded-xl p-4 text-sm font-bold text-white transition-all placeholder-stone-600" />
                     </div>

                     <div className="pt-4 border-t border-stone-800">
                        <div
                           onClick={() => setTwoStepAuth(!twoStepAuth)}
                           className="flex items-center justify-between p-4 bg-stone-800/50 rounded-xl border border-stone-700 cursor-pointer hover:bg-stone-800 transition-all group/auth"
                        >
                           <div>
                              <h4 className="font-semibold text-stone-100 text-[10px]">Multi-Factor Authentication</h4>
                              <p className="text-[8px] font-bold text-stone-500 mt-0.5">OTP verification protocol</p>
                           </div>
                           <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${twoStepAuth ? 'bg-amber-500' : 'bg-stone-900 border border-stone-700'}`}>
                              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${twoStepAuth ? 'left-7' : 'left-1'}`} />
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="mt-8">
                     <button className="w-full sm:w-auto bg-amber-500 text-stone-900 px-8 py-4 rounded-xl font-semibold text-[10px] hover:bg-white transition-all active:scale-95">Update Security</button>
                  </div>
               </div>
            </motion.div>

            {/* 3. Store Protocol */}
            <motion.div
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
               className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-stone-100 relative overflow-hidden group"
            >
               <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-[80px] -mr-32 -mb-32 pointer-events-none transition-colors duration-700" />
               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400 shadow-sm">
                        <FaStore size={20} />
                     </div>
                     <div>
                        <h3 className="font-semibold text-stone-900 text-sm">Store Protocol</h3>
                        <p className="text-[9px] font-bold text-stone-400 mt-0.5">Global operational identity</p>
                     </div>
                  </div>

                  <div className="space-y-6 flex-1">
                     <div className="space-y-1.5 flex flex-col">
                        <label className="text-[9px] font-semibold text-stone-500 ml-1">Store Name</label>
                        <input type="text" className="w-full bg-stone-50/50 hover:bg-stone-50 border border-stone-100 focus:border-amber-500/50 outline-none rounded-xl p-4 text-sm font-bold text-stone-900 transition-all focus:shadow-[0_0_15px_rgba(245,158,11,0.1)]" placeholder="ElectroSeller Official" />
                     </div>
                     <div className="space-y-1.5 flex flex-col">
                        <label className="text-[9px] font-semibold text-stone-500 ml-1">Store Address</label>
                        <textarea rows="4" className="w-full bg-stone-50/50 hover:bg-stone-50 border border-stone-100 focus:border-amber-500/50 outline-none rounded-xl p-4 text-sm font-bold text-stone-900 transition-all resize-none focus:shadow-[0_0_15px_rgba(245,158,11,0.1)]" placeholder="Neo Tokyo Cyber Hub, Sector 4..." />
                     </div>
                  </div>
                  <div className="mt-8">
                     <button className="w-full sm:w-auto bg-stone-900 text-white px-8 py-4 rounded-xl font-semibold text-[10px] hover:bg-amber-500 hover:text-stone-900 transition-all shadow-lg shadow-stone-900/10 active:scale-95">Save Store Details</button>
                  </div>
               </div>
            </motion.div>

            {/* 4. Notification Engine */}
            <motion.div
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
               className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-stone-100 relative overflow-hidden group"
            >
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-stone-100/50 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none transition-colors duration-700" />
               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400 shadow-sm">
                        <FaBell size={20} />
                     </div>
                     <div>
                        <h3 className="font-semibold text-stone-900 text-sm">Notifications</h3>
                        <p className="text-[9px] font-bold text-stone-400 mt-0.5">Manage your alerts</p>
                     </div>
                  </div>

                  <div className="space-y-3 flex-1">
                     {[
                        { id: 'email', title: 'Email Alerts', status: 'Primary Contact' },
                        { id: 'orders', title: 'Order Updates', status: 'Essential' },
                        { id: 'security', title: 'Security Alerts', status: 'Critical' },
                        { id: 'marketing', title: 'Marketing Emails', status: 'Optional' },
                        { id: 'system', title: 'System Status', status: 'Platform Updates' },
                     ].map((notif) => (
                        <div
                           key={notif.id}
                           onClick={() => setNotifications({ ...notifications, [notif.id]: !notifications[notif.id] })}
                           className="flex items-center justify-between p-4 bg-stone-50/50 hover:bg-stone-50 rounded-xl border border-stone-100 transition-all cursor-pointer group/notif"
                        >
                           <div>
                              <span className="text-[10px] font-semibold text-stone-800 group-hover/notif:text-stone-900 block">{notif.title}</span>
                              <span className="text-[8px] font-bold text-stone-400 mt-0.5">{notif.status}</span>
                           </div>
                           <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${notifications[notif.id] ? 'bg-amber-500' : 'bg-stone-200 shadow-inner'}`}>
                              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${notifications[notif.id] ? 'left-7' : 'left-1'}`} />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </motion.div>
         </div>

         {/* 5. Destructive Protocol (Full Width) */}
         <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-red-100 shadow-lg shadow-red-100/30 relative overflow-hidden block"
         >
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent to-red-50/50 pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
               <div className="flex flex-col sm:flex-row items-center gap-6 lg:gap-10">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shadow-sm flex-shrink-0">
                     <FaTrashAlt size={20} />
                  </div>
                  <div>
                     <h3 className="font-semibold text-red-900 text-sm mb-1">Destructive Protocol</h3>
                     <p className="text-[9px] font-bold text-red-500">Execute complete neural override</p>
                  </div>
                  <div className="hidden sm:block w-px h-12 bg-stone-100" />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                     <div>
                        <span className="text-[8px] font-semibold text-stone-400 block mb-1">Entity ID</span>
                        <span className="text-xs font-semibold text-stone-900">#SLR-892-DHN</span>
                     </div>
                     <div>
                        <span className="text-[8px] font-semibold text-stone-400 block mb-1">Network Status</span>
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                           <span className="text-[10px] font-semibold text-stone-900">Operational Verified</span>
                        </div>
                     </div>
                  </div>
               </div>

               <button
                  onClick={() => { if (window.confirm('CRITICAL WARNING: This action is irreversible. All store data, inventory, and history will be permanently eradicated. Proceed?')) window.location.href = '/seller-login'; }}
                  className="w-full sm:w-auto bg-white border-2 border-red-100 text-red-600 px-8 py-4 rounded-xl font-semibold text-[10px] hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-95 shadow-md shadow-red-500/10 whitespace-nowrap"
               >
                  Delete Account
               </button>
            </div>
         </motion.div>
      </div>
   );
}
