import React, { useState } from "react";
import { motion } from "framer-motion";

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
      <div className="space-y-10 animate-in fade-in duration-700">
         <div className="space-y-2">
            <h1 className="text-4xl font-black text-stone-900 italic uppercase">Settings</h1>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* 1. Executive Profile */}
            <div className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-xl shadow-stone-200/40 relative overflow-hidden flex flex-col">
               <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
               <div className="relative z-10 flex flex-col h-full space-y-8">
                  <div>
                     <h3 className="font-black text-stone-900 uppercase tracking-widest text-sm italic mb-1">Executive Profile</h3>
                     <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Manage your personal operator identity</p>
                  </div>
                  <div className="space-y-5 flex-1">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">Display Name</label>
                        <input type="text" className="w-full bg-stone-50 border border-stone-100 focus:border-amber-500/20 rounded-2xl p-4 text-xs font-bold outline-none transition-all" placeholder="" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">Mobile Number</label>
                        <input type="tel" className="w-full bg-stone-50 border border-stone-100 focus:border-amber-500/20 rounded-2xl p-4 text-xs font-bold outline-none transition-all" placeholder="" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                        <input type="email" className="w-full bg-stone-50 border border-stone-100 focus:border-amber-500/20 rounded-2xl p-4 text-xs font-bold outline-none transition-all" placeholder="" />
                     </div>

                  </div>
                  <button className="w-fit bg-stone-900 text-amber-500 px-8 py-4 rounded-[1.2rem] font-black uppercase tracking-widest text-[10px] hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/10 active:scale-95">Save Profile</button>
               </div>
            </div>

            {/* 2. Access Security */}
            <div className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-xl shadow-stone-200/40 relative overflow-hidden flex flex-col">
               <div className="absolute top-0 left-0 w-64 h-64 bg-stone-900/5 rounded-full blur-[80px] -ml-32 -mt-32 pointer-events-none" />
               <div className="relative z-10 flex flex-col h-full space-y-8">
                  <div>
                     <h3 className="font-black text-stone-900 uppercase tracking-widest text-sm italic mb-1">Access Security</h3>
                     <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Encryption and credentials</p>
                  </div>
                  <div className="space-y-5 flex-1">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">Current Password</label>
                        <input type="password" placeholder="" className="w-full bg-stone-50 border border-stone-100 focus:border-amber-500/20 rounded-2xl p-4 text-xs font-bold outline-none transition-all" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">New Password</label>
                        <input type="password" placeholder="" className="w-full bg-stone-50 border border-stone-100 focus:border-amber-500/20 rounded-2xl p-4 text-xs font-bold outline-none transition-all" />
                     </div>
                     <div className="pt-6 border-t border-stone-50" onClick={() => setTwoStepAuth(!twoStepAuth)}>
                        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100 cursor-pointer hover:bg-white transition-all">
                           <div>
                              <h4 className="font-black text-stone-900 text-[11px] uppercase">2FA Authorization</h4>
                              <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">Require OTP for login</p>
                           </div>
                           <div className={`relative w-10 h-5 rounded-full transition-colors ${twoStepAuth ? 'bg-amber-500' : 'bg-stone-200'}`}>
                              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${twoStepAuth ? 'left-6' : 'left-1'}`} />
                           </div>
                        </div>
                     </div>
                  </div>
                  <button className="w-fit bg-stone-900 text-amber-500 px-8 py-4 rounded-[1.2rem] font-black uppercase tracking-widest text-[10px] hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/10 active:scale-95">Update Security</button>
               </div>
            </div>

            {/* 3. Store Protocol */}
            <div className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-xl shadow-stone-200/40 relative overflow-hidden flex flex-col">
               <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] -mr-32 -mb-32 pointer-events-none" />
               <div className="relative z-10 flex flex-col h-full space-y-8">
                  <div>
                     <h3 className="font-black text-stone-900 uppercase tracking-widest text-sm italic mb-1">Store Protocol</h3>
                     <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Global business identity</p>
                  </div>
                  <div className="space-y-5 flex-1">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">Store Display Name</label>
                        <input type="text" className="w-full bg-stone-50 border border-stone-100 focus:border-amber-500/20 rounded-2xl p-4 text-xs font-bold outline-none transition-all" placeholder="" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1">Physical Operational Address</label>
                        <textarea rows="4" className="w-full bg-stone-50 border border-stone-100 focus:border-amber-500/20 rounded-2xl p-4 text-xs font-bold outline-none transition-all resize-none" placeholder="" />
                     </div>
                  </div>
                  <button className="w-fit bg-stone-900 text-amber-500 px-8 py-4 rounded-[1.2rem] font-black uppercase tracking-widest text-[10px] hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/10 active:scale-95">Sync Identity</button>
               </div>
            </div>

            {/* 4. Notification Engine */}
            <div className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-xl shadow-stone-200/40 relative overflow-hidden flex flex-col">
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-stone-100 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none" />
               <div className="relative z-10 flex flex-col h-full space-y-8">
                  <div>
                     <h3 className="font-black text-stone-900 uppercase tracking-widest text-sm italic mb-1">Notification Engine</h3>
                     <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Routing and broadcast signals</p>
                  </div>
                  <div className="space-y-3 flex-1">
                     {[
                        { id: 'email', title: 'Email Alerts' },
                        { id: 'orders', title: 'Order Updates' },
                        { id: 'security', title: 'Security Warnings' },
                        { id: 'marketing', title: 'Marketing Comms' },
                        { id: 'system', title: 'System Status' },
                     ].map((notif) => (
                        <div
                           key={notif.id}
                           onClick={() => setNotifications({ ...notifications, [notif.id]: !notifications[notif.id] })}
                           className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100 hover:bg-white transition-all cursor-pointer group"
                        >
                           <span className="text-[10px] font-black text-stone-600 group-hover:text-stone-900 uppercase tracking-widest">{notif.title}</span>
                           <div className={`relative w-9 h-4.5 rounded-full transition-colors ${notifications[notif.id] ? 'bg-amber-500' : 'bg-stone-200'}`}>
                              <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all ${notifications[notif.id] ? 'left-5' : 'left-0.5'}`} />
                           </div>
                        </div>
                     ))}
                  </div>
                  <button className="w-fit bg-stone-900 text-amber-500 px-8 py-4 rounded-[1.2rem] font-black uppercase tracking-widest text-[10px] hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/10 active:scale-95">Set Preferences</button>
               </div>
            </div>
         </div>

         {/* 5. Account Control (Full Width) */}
         <div className="bg-white p-6 md:p-8 rounded-[3rem] border border-stone-100 shadow-xl shadow-stone-200/40 relative overflow-hidden">
            <div className="flex flex-col xl:flex-row items-center justify-between gap-8 relative z-10">
               <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div>
                     <h3 className="font-black text-stone-900 uppercase tracking-widest text-sm italic mb-1">Account Control</h3>
                     <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Global Session Management</p>
                  </div>
                  <div className="hidden sm:block w-px h-10 bg-stone-100" />
                  <div className="flex items-center gap-6">
                     <div>
                        <span className="text-[8px] font-black text-stone-400 uppercase block mb-1">Seller ID</span>
                        <span className="text-xs font-black text-stone-900 italic">#SLR-892-DHN</span>
                     </div>
                     <div>
                        <span className="text-[8px] font-black text-stone-400 uppercase block mb-1">Status</span>
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                           <span className="text-[10px] font-black text-stone-900 uppercase">Verified Professional</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                     <h4 className="font-black text-red-900 text-[10px] uppercase italic">Account Termination</h4>
                     <p className="text-[8px] font-bold text-red-400 uppercase tracking-widest mt-0.5">Permanent data removal</p>
                  </div>
                  <button
                     onClick={() => { if(window.confirm('Are you absolutely sure? This will permanently delete your store data.')) window.location.href = '/seller-login'; }}
                     className="bg-red-50 text-red-600 border border-red-100 px-8 py-3.5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-600 hover:text-white transition-all active:scale-95 whitespace-nowrap"
                  >
                     Delete Account
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}
