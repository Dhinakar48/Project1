import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUndo, FaSearch, FaChevronRight, FaCalendarAlt, FaUser, FaWallet, FaBoxOpen } from "react-icons/fa";

export default function Returns() {
   const [returns, setReturns] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");

   useEffect(() => {
      setLoading(true);
      axios.get("http://localhost:5000/api/admin/returns")
         .then(res => {
            if (res.data.success) setReturns(res.data.returns);
            setLoading(false);
         })
         .catch(err => {
            console.error("Returns fetch error", err);
            setLoading(false);
         });
   }, []);

   const getStatusStyle = (status) => {
      switch (status?.toLowerCase()) {
         case 'returned': return 'text-amber-600 bg-amber-50 border-amber-100';
         case 'cancelled': return 'text-rose-600 bg-rose-50 border-rose-100';
         case 'refunded': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
         default: return 'text-stone-600 bg-stone-50 border-stone-100';
      }
   };

   const filteredReturns = returns.filter(r => 
      r.order_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
   );

   if (loading && returns.length === 0) return (
      <div className="flex flex-col items-center justify-center h-64 animate-pulse">
         <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
         <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Processing Returns...</p>
      </div>
   );

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex justify-between items-center">
            <div>
               <h3 className="text-xl font-bold text-stone-900 tracking-tight">Returns & Cancellations</h3>
               <p className="text-xs text-stone-500 font-medium">Manage order reversals, cancellations, and customer refund requests.</p>
            </div>
            <div className="relative">
               <input 
                  type="text" 
                  placeholder="Search ID or Customer..." 
                  className="w-80 pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
               <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
            </div>
         </div>

         <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Order ID</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Customer</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Last Activity</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Refund Value</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Status</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-50">
                  {filteredReturns.map((r) => (
                     <tr key={r.order_id} className="hover:bg-stone-50/50 transition-colors group">
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors border border-stone-100">
                                 <FaUndo size={14} />
                              </div>
                              <span className="text-sm font-bold text-stone-900 group-hover:text-rose-600 transition-colors">#{r.order_id}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-bold text-stone-900">
                           {r.customer_name}
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-2 text-stone-500">
                              <FaCalendarAlt size={10} className="text-stone-300" />
                              <span className="text-[11px] font-bold">{new Date(r.updated_at).toLocaleDateString()}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-1.5 text-stone-900">
                              <FaWallet size={10} className="text-stone-300" />
                              <span className="text-sm font-black">₹{Number(r.total_amount).toLocaleString()}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(r.order_status)}`}>
                              {r.order_status}
                           </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                           <button className="px-4 py-1.5 rounded-lg bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-sm">
                              Process
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            
            {filteredReturns.length === 0 && (
               <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-stone-100 shadow-inner">
                     <FaBoxOpen className="text-stone-200 text-3xl" />
                  </div>
                  <h4 className="text-stone-900 font-bold text-lg">Clean Sweep</h4>
                  <p className="text-stone-400 font-medium text-sm mt-1">There are no pending returns or cancellations to process.</p>
               </div>
            )}
         </div>
      </div>
   );
}
