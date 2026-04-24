import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUserCircle, FaEnvelope, FaShieldAlt, FaKey, FaBell, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";

export default function Profile() {
   const [profile, setProfile] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      // For demo, we'll use 'ADM001'. In a real app, this would come from the auth context.
      const adminId = 'ADM001';
      setLoading(true);
      axios.get(`http://localhost:5000/api/admin/profile/${adminId}`)
         .then(res => {
            if (res.data.success) setProfile(res.data.profile);
            setLoading(false);
         })
         .catch(err => {
            console.error("Profile fetch error", err);
            setLoading(false);
         });
   }, []);

   if (loading || !profile) return (
      <div className="flex flex-col items-center justify-center h-64 animate-pulse">
         <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
         <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Loading Security Profile...</p>
      </div>
   );

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div>
            <h3 className="text-xl font-bold text-stone-900 tracking-tight">Administrative Profile</h3>
            <p className="text-xs text-stone-500 font-medium">Manage your security credentials and personal platform preferences.</p>
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Profile Overview */}
            <div className="xl:col-span-1 space-y-6">
               <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm text-center">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                     <div className="w-full h-full rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-5xl shadow-xl">
                        <FaUserCircle />
                     </div>
                     <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center text-white text-[10px] shadow-sm">
                        <FaCheckCircle />
                     </div>
                  </div>
                  <h4 className="text-xl font-black text-stone-900 tracking-tight">{profile.name}</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mt-1">{profile.role}</p>
                  
                  <div className="mt-8 pt-8 border-t border-stone-50 space-y-4">
                     <div className="flex items-center gap-3 text-stone-500">
                        <FaEnvelope className="shrink-0" />
                        <span className="text-sm font-bold truncate">{profile.email}</span>
                     </div>
                     <div className="flex items-center gap-3 text-stone-500">
                        <FaShieldAlt className="shrink-0" />
                        <span className="text-sm font-bold">Encrypted Session Active</span>
                     </div>
                  </div>
               </div>

               <div className="bg-stone-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                  <h4 className="text-sm font-bold mb-4 relative z-10">Account Status</h4>
                  <div className="space-y-4 relative z-10">
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-400 font-bold uppercase tracking-widest">Join Date</span>
                        <span className="font-bold">{new Date(profile.created_at).toLocaleDateString()}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-400 font-bold uppercase tracking-widest">Last Login</span>
                        <span className="font-bold">{new Date(profile.last_login_at).toLocaleString()}</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Settings & Security */}
            <div className="xl:col-span-2 space-y-6">
               <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm">
                  <h4 className="text-lg font-bold text-stone-900 mb-8 tracking-tight">Security Configurations</h4>
                  
                  <div className="space-y-4">
                     <SettingItem 
                        icon={FaKey} 
                        title="Two-Factor Authentication" 
                        desc="Add an extra layer of security to your admin account." 
                        active={true} 
                     />
                     <SettingItem 
                        icon={FaBell} 
                        title="System Notifications" 
                        desc="Receive alerts for high-value orders and system anomalies." 
                        active={true} 
                     />
                     <SettingItem 
                        icon={FaShieldAlt} 
                        title="Audit Log Visibility" 
                        desc="Track all administrative actions performed on this platform." 
                        active={false} 
                     />
                  </div>
                  
                  <div className="mt-10 flex gap-4">
                     <button className="flex-1 py-3.5 bg-stone-900 text-white rounded-2xl text-sm font-bold hover:bg-stone-800 transition-all shadow-lg active:scale-95">
                        Update Security Credentials
                     </button>
                     <button className="flex-1 py-3.5 bg-stone-50 text-stone-600 rounded-2xl text-sm font-bold hover:bg-stone-100 transition-all border border-stone-100">
                        View Access Logs
                     </button>
                  </div>
               </div>

               <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm">
                        <FaCalendarAlt />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-stone-900">Next Security Audit</h4>
                        <p className="text-[10px] text-stone-500 font-medium">Your account is scheduled for a mandatory review in 12 days.</p>
                     </div>
                  </div>
                  <button className="px-6 py-2 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                     Schedule Now
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}

function SettingItem({ icon: Icon, title, desc, active }) {
   return (
      <div className="flex items-center justify-between p-4 rounded-3xl hover:bg-stone-50 transition-colors group border border-transparent hover:border-stone-100">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-stone-400 group-hover:text-indigo-500 shadow-sm transition-colors border border-stone-50">
               <Icon size={16} />
            </div>
            <div>
               <h5 className="text-sm font-bold text-stone-900">{title}</h5>
               <p className="text-[10px] text-stone-400 font-medium">{desc}</p>
            </div>
         </div>
         <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${active ? 'bg-indigo-500' : 'bg-stone-200'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-7' : 'left-1'}`} />
         </div>
      </div>
   );
}
