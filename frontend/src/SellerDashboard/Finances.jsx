import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaWallet, FaChartLine, FaHistory, FaArrowUp, FaArrowDown, FaPercentage } from "react-icons/fa";
import axios from "axios";

export default function Finances() {
   const [finances, setFinances] = useState([]);
   const [loading, setLoading] = useState(true);
   const [seller] = useState(() => {
      const saved = localStorage.getItem('sellerUser');
      return saved ? JSON.parse(saved) : null;
   });

   useEffect(() => {
      const fetchFinances = async () => {
         if (!seller?.seller_id) return;
         try {
            const res = await axios.get(`http://localhost:5000/api/seller/finances/daily/${seller.seller_id}`);
            setFinances(res.data);
         } catch (err) {
            console.error("Error fetching finances:", err);
         } finally {
            setLoading(false);
         }
      };
      fetchFinances();
   }, [seller]);

   const totalRevenue = finances.reduce((acc, curr) => acc + parseFloat(curr.total_revenue || 0), 0);
   const totalNet = finances.reduce((acc, curr) => acc + parseFloat(curr.net_seller_earnings || 0), 0);
   const totalCommissions = finances.reduce((acc, curr) => acc + parseFloat(curr.platform_commissions || 0), 0);

   if (loading) return (
      <div className="h-96 flex items-center justify-center">
         <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
   );

   return (
      <div className="space-y-10 animate-in fade-in zoom-in-95 duration-1000">
         {/* Header Section */}
         <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <FaWallet size={10} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Financial Protocol</span>
               </div>
               <h1 className="text-4xl font-semibold text-stone-900 tracking-tight">Finances</h1>
            </div>

            <div className="flex items-center gap-4">
               <div className="bg-white px-6 py-3 rounded-2xl border border-stone-100 shadow-sm text-right">
                  <span className="text-[9px] font-bold text-stone-400 block mb-1 uppercase">Available Balance</span>
                  <span className="text-xl font-bold text-stone-900">₹{totalNet.toLocaleString()}</span>
               </div>
            </div>
         </div>

         {/* Metric Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
               { title: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: <FaChartLine />, color: 'bg-stone-900', textColor: 'text-amber-500', trend: '+12.5%' },
               { title: 'Platform Commissions', value: `₹${totalCommissions.toLocaleString()}`, icon: <FaPercentage />, color: 'bg-white', textColor: 'text-red-500', trend: 'Fixed 10%' },
               { title: 'Net Earnings', value: `₹${totalNet.toLocaleString()}`, icon: <FaWallet />, color: 'bg-amber-500', textColor: 'text-stone-900', trend: 'Verified' },
            ].map((metric, i) => (
               <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className={`${metric.color} p-8 rounded-[2.5rem] border border-stone-100 shadow-xl shadow-stone-200/20 relative overflow-hidden group`}
               >
                  <div className="relative z-10">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${metric.color === 'bg-stone-900' ? 'bg-stone-800 text-amber-500' : metric.color === 'bg-white' ? 'bg-stone-50 text-stone-900' : 'bg-white/20 text-stone-900'}`}>
                        {metric.icon}
                     </div>
                     <span className={`text-[10px] font-bold uppercase tracking-widest ${metric.color === 'bg-stone-900' ? 'text-stone-400' : metric.color === 'bg-white' ? 'text-stone-400' : 'text-stone-800'}`}>{metric.title}</span>
                     <div className="flex items-end justify-between mt-2">
                        <span className={`text-3xl font-bold ${metric.color === 'bg-stone-900' ? 'text-white' : 'text-stone-900'}`}>{metric.value}</span>
                        <span className={`text-[10px] font-bold ${metric.textColor}`}>{metric.trend}</span>
                     </div>
                  </div>
                  {metric.color === 'bg-stone-900' && <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px] -mr-16 -mt-16" />}
               </motion.div>
            ))}
         </div>

         {/* Daily Records Table */}
         <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-stone-50 flex items-center justify-between bg-stone-50/30">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-stone-400 shadow-sm">
                     <FaHistory size={16} />
                  </div>
                  <div>
                     <h3 className="font-semibold text-stone-900 text-sm">Daily Finance Stream</h3>
                     <p className="text-[9px] font-bold text-stone-400 uppercase tracking-tight">Recent ledger updates</p>
                  </div>
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-stone-50/50">
                        <th className="px-8 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Date</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Gross Revenue</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Commission</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Net Earnings</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                     {finances.length > 0 ? finances.map((row, i) => (
                        <motion.tr 
                           key={i} 
                           initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                           className="hover:bg-stone-50/80 transition-colors group"
                        >
                           <td className="px-8 py-6">
                              <span className="text-xs font-bold text-stone-900">
                                 {new Date(row.finance_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                           </td>
                           <td className="px-8 py-6">
                              <span className="text-xs font-bold text-stone-900 group-hover:text-amber-600 transition-colors">₹{parseFloat(row.total_revenue).toLocaleString()}</span>
                           </td>
                           <td className="px-8 py-6 text-red-500">
                              <span className="text-xs font-bold">-₹{parseFloat(row.platform_commissions).toLocaleString()}</span>
                           </td>
                           <td className="px-8 py-6 text-emerald-600">
                              <span className="text-xs font-bold">₹{parseFloat(row.net_seller_earnings).toLocaleString()}</span>
                           </td>
                           <td className="px-8 py-6">
                              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[8px] font-bold uppercase tracking-widest border border-emerald-100">
                                 Settled
                              </span>
                           </td>
                        </motion.tr>
                     )) : (
                        <tr>
                           <td colSpan="5" className="px-8 py-20 text-center">
                              <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">No financial records found in the current cycle</p>
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
}
