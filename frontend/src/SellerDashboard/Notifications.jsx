import React from "react";
import { motion } from "framer-motion";
import { FaBell, FaCheck, FaTrash, FaClock } from "react-icons/fa6";

export default function Notifications({ notifications, markAsRead }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600">
             <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
             <span className="text-[9px] font-semibold tracking-widest uppercase">Center</span>
          </div>
          <h1 className="text-4xl font-semibold text-stone-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-stone-400 text-[10px] font-semibold mt-1">
             Manage your alerts and system updates
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-white border border-stone-100 px-6 py-3 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <FaBell size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-tight">Unread Alerts</p>
              <p className="text-xl font-semibold text-stone-900">{notifications.filter(n => !n.is_read).length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden min-h-[600px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[600px] text-stone-300">
            <FaBell size={48} className="mb-6 opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {notifications.map((n, i) => (
              <motion.div
                key={n.notification_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-8 hover:bg-stone-50 transition-all flex items-center justify-between group ${!n.is_read ? 'bg-amber-50/20' : ''}`}
              >
                <div className="flex items-start gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm border ${!n.is_read ? 'bg-amber-500 text-white border-amber-400' : 'bg-stone-100 text-stone-400 border-stone-200'}`}>
                    {n.type === 'New Order' ? '📦' : '🔔'}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <h3 className={`font-semibold text-lg tracking-tight ${!n.is_read ? 'text-stone-900' : 'text-stone-500'}`}>{n.type}</h3>
                      {!n.is_read && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 text-[8px] font-black uppercase tracking-tighter">New</span>}
                    </div>
                    <p className="text-stone-500 text-sm max-w-2xl font-medium leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-stone-300">
                        <FaClock size={10} />
                        <span className="text-[10px] font-bold">{new Date(n.created_at).toLocaleString()}</span>
                      </div>
                      <span className="text-stone-200">|</span>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{n.notification_id}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.is_read && (
                    <button 
                      onClick={() => markAsRead(n.notification_id)}
                      className="w-12 h-12 rounded-2xl bg-white border border-stone-100 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white hover:shadow-xl hover:shadow-green-500/20 transition-all shadow-sm"
                      title="Mark as Read"
                    >
                      <FaCheck size={16} />
                    </button>
                  )}
                  <button className="w-12 h-12 rounded-2xl bg-white border border-stone-100 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white hover:shadow-xl hover:shadow-red-500/20 transition-all shadow-sm" title="Delete Notification">
                    <FaTrash size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
