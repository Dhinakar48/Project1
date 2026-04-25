import React, { useState, useEffect } from "react";
import axios from "axios";
import {
   FaUndo, FaSearch, FaCalendarAlt, FaWallet, FaBoxOpen,
   FaCheckCircle, FaTimes, FaExclamationTriangle, FaClipboardCheck
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

export default function Returns() {
   const [returns, setReturns] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");

   // Modal state
   const [modalOpen, setModalOpen] = useState(false);
   const [selected, setSelected] = useState(null);
   const [newStatus, setNewStatus] = useState("Refunded");
   const [notes, setNotes] = useState("");
   const [processing, setProcessing] = useState(false);
   const [successMsg, setSuccessMsg] = useState("");

   const fetchReturns = () => {
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
   };

   useEffect(() => { fetchReturns(); }, []);

   const openModal = (r) => {
      setSelected(r);
      setNewStatus("Refunded");
      setNotes("");
      setSuccessMsg("");
      setModalOpen(true);
   };

   const closeModal = () => {
      if (processing) return;
      setModalOpen(false);
      setSelected(null);
   };

   const handleProcess = async () => {
      if (!selected) return;
      setProcessing(true);
      try {
         const res = await axios.patch(
            `http://localhost:5000/api/admin/returns/${selected.order_id}/process`,
            { status: newStatus, notes }
         );
         if (res.data.success) {
            // Update local state immediately
            setReturns(prev =>
               prev.map(r =>
                  r.order_id === selected.order_id
                     ? { ...r, order_status: newStatus }
                     : r
               )
            );
            setSuccessMsg(`Order #${selected.order_id} marked as ${newStatus}`);
            setTimeout(() => {
               setModalOpen(false);
               setSelected(null);
               setSuccessMsg("");
            }, 1800);
         }
      } catch (err) {
         console.error("Process return error", err);
         alert("Failed to process return. Please try again.");
      } finally {
         setProcessing(false);
      }
   };

   const getStatusStyle = (status) => {
      switch (status?.toLowerCase()) {
         case 'returned':  return 'text-amber-600 bg-amber-50 border-amber-100';
         case 'cancelled': return 'text-rose-600 bg-rose-50 border-rose-100';
         case 'refunded':  return 'text-indigo-600 bg-indigo-50 border-indigo-100';
         default:          return 'text-stone-600 bg-stone-50 border-stone-100';
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
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-[#fafafa]">
         <div className="flex justify-between items-center">
            <div>
               <h3 className="text-xl font-bold text-stone-900 tracking-tight">Returns &amp; Cancellations</h3>
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
                        <td className="px-6 py-5 text-sm font-bold text-stone-900">{r.customer_name}</td>
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
                           <button
                              onClick={() => openModal(r)}
                              className="px-4 py-1.5 rounded-lg bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-sm active:scale-95"
                           >
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

         {/* Process Modal */}
         <AnimatePresence>
            {modalOpen && selected && (
               <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
               >
                  {/* Backdrop */}
                  <motion.div
                     className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
                     onClick={closeModal}
                  />

                  {/* Panel */}
                  <motion.div
                     className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 z-10"
                     initial={{ scale: 0.92, y: 24 }}
                     animate={{ scale: 1, y: 0 }}
                     exit={{ scale: 0.92, y: 24 }}
                     transition={{ type: "spring", damping: 22, stiffness: 300 }}
                  >
                     {/* Success overlay */}
                     {successMsg && (
                        <div className="absolute inset-0 bg-white rounded-[2rem] flex flex-col items-center justify-center gap-3 z-20">
                           <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                              <FaCheckCircle className="text-emerald-500 text-3xl" />
                           </div>
                           <p className="text-sm font-bold text-stone-900 text-center">{successMsg}</p>
                        </div>
                     )}

                     {/* Close */}
                     <button
                        onClick={closeModal}
                        disabled={processing}
                        className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-all"
                     >
                        <FaTimes size={12} />
                     </button>

                     {/* Header */}
                     <div className="flex items-center gap-3 mb-6">
                        <div className="w-11 h-11 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                           <FaClipboardCheck size={18} />
                        </div>
                        <div>
                           <h4 className="text-lg font-bold text-stone-900 tracking-tight">Process Return</h4>
                           <p className="text-[11px] text-stone-400 font-medium">Order #{selected.order_id} · {selected.customer_name}</p>
                        </div>
                     </div>

                     {/* Current status */}
                     <div className="mb-5 p-4 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Current Status</span>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(selected.order_status)}`}>
                           {selected.order_status}
                        </span>
                     </div>

                     {/* Resolution Status */}
                     <div className="mb-5">
                        <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">
                           Resolution Action
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                           {[
                              { value: 'Refunded', color: 'indigo' },
                              { value: 'Returned', color: 'amber'  },
                           ].map(({ value, color }) => {
                              const active = newStatus === value;
                              const cls = {
                                 indigo: active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100',
                                 amber:  active ? 'bg-amber-500 text-white border-amber-500'   : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100',
                                 rose:   active ? 'bg-rose-500 text-white border-rose-500'     : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100',
                              }[color];
                              return (
                                 <button
                                    key={value}
                                    onClick={() => setNewStatus(value)}
                                    className={`py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${cls}`}
                                 >
                                    {value}
                                 </button>
                              );
                           })}
                        </div>
                     </div>

                     {/* Notes */}
                     <div className="mb-7">
                        <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2">
                           Notes <span className="text-stone-300 normal-case font-medium">(optional)</span>
                        </label>
                        <textarea
                           rows={3}
                           value={notes}
                           onChange={(e) => setNotes(e.target.value)}
                           placeholder="e.g. Refund initiated via payment gateway…"
                           className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all resize-none"
                        />
                     </div>

                     {/* Warning */}
                     <div className="flex items-start gap-2 mb-6 p-3 rounded-xl bg-amber-50 border border-amber-100">
                        <FaExclamationTriangle className="text-amber-400 mt-0.5 shrink-0" size={12} />
                        <p className="text-[10px] text-amber-700 font-semibold leading-relaxed">
                           This action will update the order status and log it in the order history. It cannot be undone automatically.
                        </p>
                     </div>

                     {/* Actions */}
                     <div className="flex gap-3">
                        <button
                           onClick={closeModal}
                           disabled={processing}
                           className="flex-1 py-3 rounded-xl border border-stone-200 text-[11px] font-black uppercase tracking-widest text-stone-500 hover:bg-stone-50 transition-all disabled:opacity-50"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={handleProcess}
                           disabled={processing}
                           className="flex-1 py-3 rounded-xl bg-stone-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                           {processing ? (
                              <>
                                 <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                 Processing…
                              </>
                           ) : (
                              <>
                                 <FaCheckCircle size={12} /> Confirm
                              </>
                           )}
                        </button>
                     </div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
}
