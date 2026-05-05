import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaHistory, FaSearch, FaUserShield, FaClock, FaDesktop } from "react-icons/fa";

export default function AuditLogs() {
   const [logs, setLogs] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");

   const fetchLogs = () => {
      setLoading(true);
      axios.get("http://localhost:5000/api/admin/audit-logs")
         .then(res => {
            if (res.data.success) setLogs(res.data.logs);
            setLoading(false);
         })
         .catch(err => {
            console.error("Audit logs fetch error", err);
            setLoading(false);
         });
   };

   useEffect(() => {
      fetchLogs();
   }, []);

   const getActionColor = (action) => {
      switch (action?.toUpperCase()) {
         case 'INSERT':
         case 'CREATE_COUPON':
            return 'text-emerald-600 bg-emerald-50 border-emerald-100';
         case 'UPDATE':
         case 'STATUS_UPDATE':
         case 'UPDATE_COUPON_STATUS':
            return 'text-blue-600 bg-blue-50 border-blue-100';
         case 'DELETE':
         case 'DELETE_COUPON':
            return 'text-rose-600 bg-rose-50 border-rose-100';
         case 'LOGIN':
            return 'text-amber-600 bg-amber-50 border-amber-100';
         case 'SHIPROCKET_SYNC':
            return 'text-violet-600 bg-violet-50 border-violet-100';
         default:
            return 'text-stone-600 bg-stone-50 border-stone-100';
      }
   };

   const filteredLogs = logs.filter(l => 
      l.action?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.admin_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.table_name?.toLowerCase().includes(searchQuery.toLowerCase())
   );

   if (loading) return (
      <div className="flex flex-col items-center justify-center h-64 animate-pulse">
         <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
         <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Loading Security Logs...</p>
      </div>
   );

   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex justify-between items-center">
            <div>
               <h3 className="text-xl font-bold text-stone-900 tracking-tight">System Audit Logs</h3>
               <p className="text-xs text-stone-500 font-medium">Track all administrative activities and security events.</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="relative">
                  <input 
                     type="text" 
                     placeholder="Search Action or Admin..." 
                     className="w-64 pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all focus:w-80 shadow-sm"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
               </div>
            </div>
         </div>

         <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Event Time</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Administrator</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Action Type</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Module</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Device Info</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-50">
                  {filteredLogs.map((log) => (
                     <tr key={log.audit_id} className="hover:bg-stone-50/50 transition-colors group">
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-2 text-stone-500">
                              <FaClock size={10} className="text-stone-300" />
                              <span className="text-[11px] font-bold">{new Date(log.created_at).toLocaleString()}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400">
                                 <FaUserShield size={12} />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-sm font-bold text-stone-900">{log.admin_name || 'System'}</span>
                                 <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">ID: {log.admin_id || 'AUTO'}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getActionColor(log.action)}`}>
                              {log.action}
                           </span>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-stone-700 uppercase tracking-tight">{log.table_name}</span>
                              <span className="text-[10px] text-stone-400 font-medium">Record: {log.record_id}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-2 text-stone-400">
                              <FaDesktop size={10} />
                              <span className="text-[10px] font-medium">{log.ip_address || 'Internal'}</span>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>

            {filteredLogs.length === 0 && (
               <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-stone-100 shadow-inner">
                     <FaHistory className="text-stone-200 text-3xl" />
                  </div>
                  <h4 className="text-stone-900 font-bold text-lg">No Logs Found</h4>
                  <p className="text-stone-400 font-medium text-sm mt-1">System activity logs will appear here as events occur.</p>
               </div>
            )}
         </div>
      </div>
   );
}
