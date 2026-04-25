import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
   FaCreditCard, FaSearch, FaCalendarAlt, FaWallet, FaCheckCircle,
   FaExclamationCircle, FaChartLine, FaPercentage, FaArrowUp,
   FaHistory, FaReceipt, FaFileCsv, FaFilePdf, FaFileDownload, FaChevronDown
} from "react-icons/fa";

export default function Payments() {
   const [view, setView] = useState("transactions");
   const [transactions, setTransactions] = useState([]);
   const [customerPayments, setCustomerPayments] = useState([]);
   const [stats, setStats] = useState({ total_revenue: 0, total_commissions: 0, total_net: 0 });
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");
   const [reportOpen, setReportOpen] = useState(false);
   const reportRef = useRef(null);

   useEffect(() => { fetchData(); }, []);

   useEffect(() => {
      const handleClick = (e) => {
         if (reportRef.current && !reportRef.current.contains(e.target)) {
            setReportOpen(false);
         }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
   }, []);

   const fetchData = async () => {
      setLoading(true);
      try {
         const [txnRes, statRes, payRes] = await Promise.all([
            axios.get("http://localhost:5000/api/admin/finance-transactions"),
            axios.get("http://localhost:5000/api/admin/finance-stats"),
            axios.get("http://localhost:5000/api/admin/transactions")
         ]);
         if (txnRes.data.success) setTransactions(txnRes.data.transactions);
         if (statRes.data.success) setStats(statRes.data.stats);
         if (payRes.data.success) setCustomerPayments(payRes.data.transactions);
      } catch (err) {
         console.error("Finance fetch error", err);
      }
      setLoading(false);
   };

   const getStatusStyle = (status) => {
      switch (status?.toLowerCase()) {
         case 'sale': case 'paid': case 'success': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
         case 'payout': case 'pending': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
         case 'refund': case 'failed': return 'text-rose-600 bg-rose-50 border-rose-100';
         default: return 'text-stone-600 bg-stone-50 border-stone-100';
      }
   };

   const currentData = view === 'transactions' ? transactions : customerPayments;

   const filteredData = currentData.filter(item => {
      const id = item.finance_transaction_id || item.payment_id || "";
      const orderId = item.order_id || "";
      const name = item.seller_name || item.customer_name || "";
      return id.toLowerCase().includes(searchQuery.toLowerCase()) ||
         orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
         name.toLowerCase().includes(searchQuery.toLowerCase());
   });

   // ── Report Generation ──────────────────────────────────────────────────
   const getReportTitle = () =>
      view === 'transactions' ? 'Finance_Ledger' : 'Customer_Payments';

   const buildCSVRows = () => {
      const header = ['Ref ID', 'Entity / Order', 'Method', 'Date', 'Amount (₹)', 'Status'];
      const rows = filteredData.map(item => [
         item.finance_transaction_id || item.payment_id || '',
         `${item.seller_name || item.customer_name || 'System'} / ${item.order_id || ''}`,
         item.payment_method || 'System',
         new Date(item.created_at || item.paid_at).toLocaleDateString(),
         Number(item.amount || item.order_total || 0).toFixed(2),
         item.transaction_type || item.payment_status || '',
      ]);
      return [header, ...rows];
   };

   const downloadCSV = () => {
      const rows = buildCSVRows();
      const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${getReportTitle()}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setReportOpen(false);
   };

   const downloadPDF = () => {
      const rows = buildCSVRows();
      const title = getReportTitle().replace(/_/g, ' ');
      const date = new Date().toLocaleString();

      const tableRows = rows.slice(1).map(r =>
         `<tr>${r.map((c, i) => `<td style="padding:8px 12px;border-bottom:1px solid #f1f1f1;font-size:11px;color:${i === 4 ? '#4f46e5' : '#1c1917'}">${c}</td>`).join('')}</tr>`
      ).join('');

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${title} Report</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 32px; color: #1c1917; background: #fff; }
    .header { background: #0f172a; color: white; padding: 32px; border-radius: 16px; margin-bottom: 28px; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
    .header p  { margin: 6px 0 0; font-size: 11px; opacity: 0.5; letter-spacing: 2px; text-transform: uppercase; }
    .stats { display: flex; gap: 16px; margin-bottom: 28px; }
    .stat  { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px 20px; border-radius: 12px; }
    .stat-label { font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; }
    .stat-value { font-size: 18px; font-weight: 900; color: #1c1917; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; }
    thead th { background: #f8fafc; padding: 10px 12px; text-align: left; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; border-bottom: 2px solid #e2e8f0; }
    tbody tr:hover td { background: #f8fafc; }
    .footer { margin-top: 32px; font-size: 9px; color: #cbd5e1; text-align: center; letter-spacing: 2px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title} Report</h1>
    <p>Generated on ${date} · AdminCore Platform</p>
  </div>
  <div class="stats">
    <div class="stat"><div class="stat-label">Platform Volume</div><div class="stat-value">₹${Number(stats.total_revenue).toLocaleString()}</div></div>
    <div class="stat"><div class="stat-label">Gross Commissions</div><div class="stat-value">₹${Number(stats.total_commissions).toLocaleString()}</div></div>
    <div class="stat"><div class="stat-label">Seller Settlements</div><div class="stat-value">₹${Number(stats.total_net).toLocaleString()}</div></div>
    <div class="stat"><div class="stat-label">Records</div><div class="stat-value">${filteredData.length}</div></div>
  </div>
  <table>
    <thead><tr>${rows[0].map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  <div class="footer">Confidential · AdminCore · ${date}</div>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (win) {
         win.onload = () => { win.print(); };
      }
      setReportOpen(false);
   };
   // ───────────────────────────────────────────────────────────────────────

   const metrics = [
      { title: 'Platform Volume', value: `₹${Number(stats.total_revenue).toLocaleString()}`, icon: <FaChartLine />, color: 'bg-stone-900', trend: '+8.4%' },
      { title: 'Gross Commissions', value: `₹${Number(stats.total_commissions).toLocaleString()}`, icon: <FaPercentage />, color: 'bg-white', trend: '10% Avg' },
      { title: 'Seller Settlements', value: `₹${Number(stats.total_net).toLocaleString()}`, icon: <FaWallet />, color: 'bg-indigo-600', trend: 'Verified' },
   ];

   if (loading && currentData.length === 0) return (
      <div className="flex flex-col items-center justify-center h-64 animate-pulse">
         <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
         <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Ledger...</p>
      </div>
   );

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 bg-[#fafafa]">
         <div className="flex justify-between items-end">
            <div>
               <h3 className="text-3xl font-black text-stone-900 tracking-tight">Financial Intelligence</h3>
               <p className="text-stone-500 font-medium mt-1">Comprehensive monitoring of platform revenue and customer payment cycles.</p>
            </div>
            <div className="flex items-center gap-6">
               {/* View Toggle */}
               <div className="bg-stone-100 p-1 rounded-2xl flex items-center shadow-inner">
                  <button
                     onClick={() => setView('transactions')}
                     className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'transactions' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                  >
                     Finance Ledger
                  </button>
                  <button
                     onClick={() => setView('payments')}
                     className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'payments' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                  >
                     Customer Payments
                  </button>
               </div>
               <div className="relative">
                  <input
                     type="text"
                     placeholder="Search ID, Order or Entity..."
                     className="w-80 pl-10 pr-4 py-3.5 rounded-2xl border border-stone-200 bg-white text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
               </div>
            </div>
         </div>

         {/* Metric Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.map((metric, i) => (
               <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className={`${metric.color} p-8 rounded-[3rem] border border-stone-100 shadow-xl shadow-stone-200/20 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}
               >
                  <div className="relative z-10">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${metric.color === 'bg-stone-900' ? 'bg-stone-800 text-amber-500' : metric.color === 'bg-white' ? 'bg-indigo-50 text-indigo-600' : 'bg-white/20 text-white'}`}>
                        {metric.icon}
                     </div>
                     <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${metric.color === 'bg-stone-900' ? 'text-stone-500' : metric.color === 'bg-white' ? 'text-stone-400' : 'text-indigo-100'}`}>{metric.title}</span>
                     <div className="flex items-end justify-between mt-2">
                        <span className={`text-3xl font-black ${metric.color === 'bg-stone-900' ? 'text-white' : metric.color === 'bg-white' ? 'text-stone-900' : 'text-white'}`}>{metric.value}</span>
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${metric.color === 'bg-white' ? 'bg-emerald-50 text-emerald-600' : 'bg-white/10 text-white'}`}>
                           <FaArrowUp size={8} /> {metric.trend}
                        </div>
                     </div>
                  </div>
                  <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-20 ${metric.color === 'bg-stone-900' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
               </motion.div>
            ))}
         </div>

         <div className="bg-white rounded-[3rem] border border-stone-100 shadow-sm overflow-hidden min-h-[400px]">
            <div className="p-8 border-b border-stone-50 flex justify-between items-center bg-stone-50/20">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                     {view === 'transactions' ? <FaHistory size={12} /> : <FaReceipt size={12} />}
                  </div>
                  <h4 className="text-sm font-black text-stone-900 uppercase tracking-widest">
                     {view === 'transactions' ? 'Master Financial Ledger' : 'Customer Payment Records'}
                  </h4>
               </div>

               {/* Generate Report Dropdown */}
               <div className="relative" ref={reportRef}>
                  <button
                     onClick={() => setReportOpen(prev => !prev)}
                     className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                  >
                     <FaFileDownload size={11} />
                     Generate Report
                     <FaChevronDown size={8} className={`transition-transform duration-200 ${reportOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                     {reportOpen && (
                        <motion.div
                           initial={{ opacity: 0, y: 8, scale: 0.95 }}
                           animate={{ opacity: 1, y: 0, scale: 1 }}
                           exit={{ opacity: 0, y: 8, scale: 0.95 }}
                           transition={{ duration: 0.15 }}
                           className="absolute right-0 top-full mt-2 w-52 bg-white border border-stone-100 rounded-2xl shadow-xl shadow-stone-200/40 overflow-hidden z-50"
                        >
                           <div className="px-4 py-3 bg-stone-50 border-b border-stone-100">
                              <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Download Format</p>
                              <p className="text-[10px] font-bold text-stone-600 mt-0.5">{filteredData.length} records</p>
                           </div>

                           <button
                              onClick={downloadCSV}
                              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-emerald-50 transition-colors group text-left"
                           >
                              <div className="w-8 h-8 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center text-emerald-600 transition-colors border border-emerald-100">
                                 <FaFileCsv size={13} />
                              </div>
                              <div>
                                 <p className="text-[11px] font-black text-stone-900">Download CSV</p>
                                 <p className="text-[9px] text-stone-400 font-medium">Spreadsheet format</p>
                              </div>
                           </button>

                           <button
                              onClick={downloadPDF}
                              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-rose-50 transition-colors group text-left border-t border-stone-50"
                           >
                              <div className="w-8 h-8 rounded-xl bg-rose-50 group-hover:bg-rose-100 flex items-center justify-center text-rose-600 transition-colors border border-rose-100">
                                 <FaFilePdf size={13} />
                              </div>
                              <div>
                                 <p className="text-[11px] font-black text-stone-900">Download PDF</p>
                                 <p className="text-[9px] text-stone-400 font-medium">Print-ready report</p>
                              </div>
                           </button>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>
            </div>

            <AnimatePresence mode="wait">
               <motion.div
                  key={view}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
               >
                  <table className="w-full text-left">
                     <thead className="bg-stone-50/50 border-b border-stone-100">
                        <tr>
                           <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">Ref ID</th>
                           <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">{view === 'transactions' ? 'Merchant' : 'Customer'} / Order</th>
                           <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">Method</th>
                           <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">Date</th>
                           <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">Value</th>
                           <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-stone-50">
                        {filteredData.map((item) => (
                           <tr key={item.finance_transaction_id || item.payment_id} className="hover:bg-stone-50/30 transition-colors group">
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all border border-stone-100">
                                       <FaCreditCard size={14} />
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-sm font-bold text-stone-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                                          {item.finance_transaction_id || item.payment_id}
                                       </span>
                                       <span className="text-[10px] font-mono font-bold text-stone-400 truncate w-32">
                                          {item.payment_id || item.transaction_id || item.seller_payout_id || 'INTERNAL_LEDGER'}
                                       </span>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex flex-col">
                                    <span className="text-sm font-bold text-stone-900">{item.seller_name || item.customer_name || 'System'}</span>
                                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">Order ID: #{item.order_id}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 text-stone-600 text-[11px] font-bold border border-stone-100 uppercase tracking-tighter">
                                    {item.payment_method || 'System'}
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-2 text-stone-500">
                                    <FaCalendarAlt size={10} className="text-stone-300" />
                                    <span className="text-[11px] font-bold text-stone-600">{new Date(item.created_at || item.paid_at).toLocaleDateString()}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <span className={`text-sm font-black ${item.transaction_type === 'Payout' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {item.transaction_type === 'Payout' ? '-' : '+'} ₹{Number(item.amount || item.order_total).toLocaleString()}
                                 </span>
                              </td>
                              <td className="px-8 py-6">
                                 <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit ${getStatusStyle(item.transaction_type || item.payment_status)}`}>
                                    {(item.transaction_type || item.payment_status)?.toLowerCase() === 'sale' || (item.transaction_type || item.payment_status)?.toLowerCase() === 'paid'
                                       ? <FaCheckCircle /> : <FaExclamationCircle />}
                                    {item.transaction_type || item.payment_status}
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </motion.div>
            </AnimatePresence>

            {filteredData.length === 0 && (
               <div className="p-32 text-center bg-stone-50/30">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 border border-stone-100 shadow-xl shadow-stone-200/20">
                     <FaWallet className="text-stone-200 text-4xl" />
                  </div>
                  <h4 className="text-stone-900 font-black text-xl tracking-tight">No Records Found</h4>
                  <p className="text-stone-400 font-medium text-sm mt-2 max-w-xs mx-auto">We couldn't find any financial data matching your search.</p>
               </div>
            )}
         </div>
      </div>
   );
}
