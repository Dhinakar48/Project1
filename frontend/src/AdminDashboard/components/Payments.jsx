import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCreditCard, FaSearch, FaChevronRight, FaCalendarAlt, FaUser, FaWallet, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export default function Payments() {
   const [transactions, setTransactions] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");

   useEffect(() => {
      setLoading(true);
      axios.get("http://localhost:5000/api/admin/transactions")
         .then(res => {
            if (res.data.success) setTransactions(res.data.transactions);
            setLoading(false);
         })
         .catch(err => {
            console.error("Transactions fetch error", err);
            setLoading(false);
         });
   }, []);

   const getStatusStyle = (status) => {
      switch (status?.toLowerCase()) {
         case 'paid': 
         case 'success': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
         case 'pending': return 'text-amber-600 bg-amber-50 border-amber-100';
         case 'failed': return 'text-rose-600 bg-rose-50 border-rose-100';
         default: return 'text-stone-600 bg-stone-50 border-stone-100';
      }
   };

   const filteredTransactions = transactions.filter(t => 
      t.payment_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
   );

   if (loading && transactions.length === 0) return (
      <div className="flex flex-col items-center justify-center h-64 animate-pulse">
         <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
         <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Verifying Ledger...</p>
      </div>
   );

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex justify-between items-center">
            <div>
               <h3 className="text-xl font-bold text-stone-900 tracking-tight">Financial Transactions</h3>
               <p className="text-xs text-stone-500 font-medium">A centralized ledger of all platform payments and settlement records.</p>
            </div>
            <div className="relative">
               <input 
                  type="text" 
                  placeholder="Search ID, Order or Customer..." 
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
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Transaction Ref</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Customer / Order</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Payment Method</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Settled On</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Net Value</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-50">
                  {filteredTransactions.map((tx) => (
                     <tr key={tx.payment_id} className="hover:bg-stone-50/50 transition-colors group">
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors border border-stone-100">
                                 <FaCreditCard size={14} />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-sm font-bold text-stone-900 group-hover:text-indigo-600 transition-colors">{tx.payment_id}</span>
                                 <span className="text-[10px] font-mono font-bold text-stone-400 truncate w-32">{tx.transaction_id || 'INTERNAL_ID'}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-stone-900">{tx.customer_name}</span>
                              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">Order ID: #{tx.order_id}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 text-stone-600 text-[11px] font-bold border border-stone-100 uppercase tracking-tighter">
                              {tx.payment_method}
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-2 text-stone-500">
                              <FaCalendarAlt size={10} className="text-stone-300" />
                              <span className="text-[11px] font-bold">{new Date(tx.paid_at || tx.created_at).toLocaleDateString()}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-1.5 text-stone-900">
                              <FaWallet size={10} className="text-stone-300" />
                              <span className="text-sm font-black">₹{Number(tx.amount).toLocaleString()}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit ${getStatusStyle(tx.payment_status)}`}>
                              {tx.payment_status?.toLowerCase() === 'paid' ? <FaCheckCircle /> : <FaExclamationCircle />}
                              {tx.payment_status}
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            
            {filteredTransactions.length === 0 && (
               <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-stone-100 shadow-inner">
                     <FaWallet className="text-stone-200 text-3xl" />
                  </div>
                  <h4 className="text-stone-900 font-bold text-lg">No Transactions Recorded</h4>
                  <p className="text-stone-400 font-medium text-sm mt-1">We couldn't find any financial records matching your search.</p>
               </div>
            )}
         </div>
      </div>
   );
}
