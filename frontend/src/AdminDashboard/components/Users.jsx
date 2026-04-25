import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
   FaUsers, FaUserShield, FaStore, FaSearch, FaEllipsisV,
   FaEnvelope, FaPhone, FaCheckCircle, FaTimesCircle, FaBan,
   FaArrowLeft, FaShoppingBag, FaBoxOpen, FaRupeeSign,
   FaCalendarAlt, FaIdCard, FaShieldAlt, FaMapMarkerAlt, FaTimes,
   FaUniversity, FaClipboardList, FaFileAlt, FaInfoCircle
} from "react-icons/fa";

const STATUS_STYLE = {
   Delivered:  'bg-emerald-50 text-emerald-600 border-emerald-100',
   Shipped:    'bg-blue-50 text-blue-600 border-blue-100',
   Confirmed:  'bg-amber-50 text-amber-600 border-amber-100',
   Cancelled:  'bg-rose-50 text-rose-600 border-rose-100',
   Returned:   'bg-orange-50 text-orange-600 border-orange-100',
   Refunded:   'bg-indigo-50 text-indigo-600 border-indigo-100',
};

export default function Users() {
   const [users, setUsers]           = useState([]);
   const [loading, setLoading]       = useState(true);
   const [searchQuery, setSearchQuery] = useState("");
   const [filter, setFilter]         = useState("All");
   const [activeMenu, setActiveMenu] = useState(null);

   // Detail panel
   const [detailUser, setDetailUser]   = useState(null);   // { profile, orders, stats }
   const [detailLoading, setDetailLoading] = useState(false);
   const [panelOpen, setPanelOpen]     = useState(false);

   const fetchUsers = () => {
      setLoading(true);
      axios.get("http://localhost:5000/api/admin/all-users")
         .then(res => { if (res.data.success) setUsers(res.data.users); setLoading(false); })
         .catch(err => { console.error("Users fetch error", err); setLoading(false); });
   };

   useEffect(() => { fetchUsers(); }, []);

   const openDetail = (user) => {
      setPanelOpen(true);
      setDetailUser(null);
      setDetailLoading(true);
      axios.get(`http://localhost:5000/api/admin/user-detail/${user.type}/${user.id}`)
         .then(res => { if (res.data.success) setDetailUser(res.data); })
         .catch(err => console.error("User detail error", err))
         .finally(() => setDetailLoading(false));
   };

   const closePanel = () => { setPanelOpen(false); setTimeout(() => setDetailUser(null), 300); };

   const handleToggleStatus = (userId, type, currentStatus) => {
      axios.patch("http://localhost:5000/api/admin/toggle-user-status", {
         userId, type, isActive: !currentStatus
      }).then(res => {
         if (res.data.success) { fetchUsers(); setActiveMenu(null); }
      }).catch(err => console.error("Toggle status error", err));
   };

   const filteredUsers = users.filter(u => {
      const matchesSearch =
         u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         u.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === "All" || u.type === filter;
      return matchesSearch && matchesFilter;
   });

   if (loading && users.length === 0) return (
      <div className="flex flex-col items-center justify-center h-64 animate-pulse">
         <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
         <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Accessing Directory...</p>
      </div>
   );

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-[#fafafa] relative min-h-screen">
         {/* Header */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
               <h3 className="text-xl font-bold text-stone-900 tracking-tight">Identity &amp; Access Management</h3>
               <p className="text-xs text-stone-500 font-medium">Manage all platform stakeholders, including customers and verified merchants.</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="relative flex-1 md:flex-none">
                  <input
                     type="text"
                     placeholder="Search ID, Name or Email..."
                     className="w-full md:w-80 pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
               </div>
               <select
                  className="px-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-sm font-bold text-stone-900 focus:outline-none shadow-sm"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
               >
                  <option value="All">All Types</option>
                  <option value="Customer">Customers</option>
                  <option value="Seller">Sellers</option>
               </select>
            </div>
         </div>

         {/* Cards Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
               <div
                  key={user.id}
                  className="bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden cursor-pointer"
                  onClick={() => openDetail(user)}
               >
                  {/* Status Badge */}
                  <div className="absolute top-6 left-6">
                     <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border flex items-center gap-1 ${user.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                        {user.is_active ? <FaCheckCircle size={8} /> : <FaTimesCircle size={8} />}
                        {user.is_active ? 'Active' : 'Blocked'}
                     </span>
                  </div>

                  {/* Options Menu */}
                  <div className="absolute top-6 right-6" onClick={(e) => e.stopPropagation()}>
                     <button
                        onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                        className="text-stone-300 hover:text-stone-900 transition-colors p-2"
                     >
                        <FaEllipsisV size={12} />
                     </button>
                     {activeMenu === user.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-stone-100 shadow-2xl z-50 py-2 animate-in zoom-in-95 duration-200 origin-top-right">
                           <button
                              onClick={() => handleToggleStatus(user.id, user.type, user.is_active)}
                              className={`w-full text-left px-4 py-2 text-xs font-bold flex items-center gap-2 hover:bg-stone-50 transition-colors ${user.is_active ? 'text-rose-500' : 'text-emerald-500'}`}
                           >
                              {user.is_active ? <FaBan /> : <FaCheckCircle />}
                              {user.is_active ? (user.type === 'Seller' ? 'Block Seller' : 'Deactivate User') : 'Activate User'}
                           </button>
                           <button className="w-full text-left px-4 py-2 text-xs font-bold text-stone-600 flex items-center gap-2 hover:bg-stone-50 transition-colors">
                              <FaEnvelope /> Send Email
                           </button>
                        </div>
                     )}
                  </div>

                  <div className="flex flex-col items-center text-center mt-4 mb-6">
                     <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-inner overflow-hidden mb-4 ${user.type === 'Seller' ? 'bg-indigo-50 text-indigo-500' : 'bg-emerald-50 text-emerald-500'}`}>
                        {user.image ? (
                           <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                           user.type === 'Seller' ? <FaStore /> : <FaUsers />
                        )}
                     </div>
                     <div>
                        <div className="text-base font-bold text-stone-900 group-hover:text-indigo-600 transition-colors">{user.name}</div>
                        <div className={`text-[9px] font-black uppercase tracking-widest mt-1 px-3 py-1 rounded-full inline-block ${user.type === 'Seller' ? 'bg-indigo-500 text-white' : 'bg-stone-900 text-white'} shadow-lg`}>
                           {user.type}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3 bg-stone-50/50 p-4 rounded-3xl border border-stone-100">
                     <div className="flex items-center gap-3 text-stone-500">
                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-xs shadow-sm"><FaEnvelope /></div>
                        <span className="text-xs font-bold truncate">{user.email}</span>
                     </div>
                     <div className="flex items-center gap-3 text-stone-500">
                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-xs shadow-sm"><FaPhone /></div>
                        <span className="text-xs font-bold">{user.phone || 'No phone recorded'}</span>
                     </div>
                  </div>

                  <div className="mt-2 pt-3 border-t border-stone-50 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Joined On</span>
                        <span className="text-[11px] font-bold text-stone-900">{new Date(user.created_at).toLocaleDateString()}</span>
                     </div>
                     <div className="flex flex-col text-right">
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">User ID</span>
                        <span className="text-[11px] font-mono font-bold text-stone-900">{user.id}</span>
                     </div>
                  </div>

                  {/* Click hint */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">Click to view details</span>
                  </div>
               </div>
            ))}
         </div>

         {filteredUsers.length === 0 && (
            <div className="p-20 text-center bg-white rounded-[3rem] border border-stone-100 shadow-sm">
               <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-stone-100 shadow-inner">
                  <FaUserShield className="text-stone-200 text-3xl" />
               </div>
               <h4 className="text-stone-900 font-bold text-lg">No Users Matched</h4>
               <p className="text-stone-400 font-medium text-sm mt-1">We couldn't find any accounts matching your search criteria.</p>
            </div>
         )}

         {/* ── Professional Account Intelligence Overlay ── */}
         <AnimatePresence>
            {panelOpen && (
               <motion.div
                  className="fixed inset-0 bg-[#f8fafc] z-[60] overflow-hidden flex flex-col"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
               >
                  {/* Top Navigation Bar */}
                  <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0 z-20 shadow-sm">
                     <div className="flex items-center gap-6">
                        <button
                           onClick={closePanel}
                           className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors group"
                        >
                           <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                           Back to Directory
                        </button>
                        <div className="h-6 w-px bg-slate-200" />
                        <h4 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3">
                           Account Intelligence
                           <span className="bg-slate-100 text-slate-500 text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-black">
                              Internal Audit
                           </span>
                        </h4>
                     </div>
                     <div className="flex items-center gap-4">
                        <button
                           onClick={closePanel}
                           className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                        >
                           <FaTimes size={16} />
                        </button>
                     </div>
                  </div>

                  {/* Dashboard Layout */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden">
                     <div className="max-w-[1600px] mx-auto min-h-full flex flex-col lg:flex-row">
                        
                        {/* Sidebar: Profile Summary */}
                        <aside className="lg:w-96 bg-white border-r border-slate-100 p-8 lg:sticky lg:top-0 h-fit shrink-0">
                           {detailLoading ? (
                              <div className="space-y-8 animate-pulse">
                                 <div className="w-32 h-32 bg-slate-100 rounded-[2.5rem] mx-auto" />
                                 <div className="h-8 bg-slate-100 rounded-xl w-3/4 mx-auto" />
                                 <div className="h-4 bg-slate-100 rounded-lg w-1/2 mx-auto" />
                                 <div className="space-y-4 pt-8">
                                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-50 rounded-2xl" />)}
                                 </div>
                              </div>
                           ) : detailUser && (
                              <div className="space-y-10">
                                 {/* Profile Card */}
                                 <div className="text-center">
                                    <div className="relative inline-block mb-6">
                                       <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl relative z-10 overflow-hidden ${detailUser.profile.type === 'Seller' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
                                          {detailUser.profile.image
                                             ? <img src={detailUser.profile.image} alt="" className="w-full h-full object-cover" />
                                             : detailUser.profile.type === 'Seller' ? <FaStore /> : <FaUsers />}
                                       </div>
                                       <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl border-4 border-white flex items-center justify-center z-20 shadow-lg ${detailUser.profile.is_active ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                          {detailUser.profile.is_active ? <FaCheckCircle size={14} /> : <FaBan size={14} />}
                                       </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{detailUser.profile.name}</h3>
                                    <div className="mt-3 flex items-center justify-center gap-2">
                                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${detailUser.profile.type === 'Seller' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                          {detailUser.profile.type}
                                       </span>
                                       {detailUser.profile.is_verified && (
                                          <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                             <FaCheckCircle size={10} /> Verified
                                          </span>
                                       )}
                                    </div>
                                 </div>

                                 {/* Contact & Meta */}
                                 <div className="space-y-2">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4">Core Credentials</h5>
                                    <SidebarLink icon={<FaEnvelope />} label="Email Address" value={detailUser.profile.email} />
                                    <SidebarLink icon={<FaPhone />} label="Contact Number" value={detailUser.profile.phone || 'Unset'} />
                                    <SidebarLink icon={<FaIdCard />} label="System Identity" value={detailUser.profile.id} mono />
                                    <SidebarLink icon={<FaCalendarAlt />} label="Registration" value={new Date(detailUser.profile.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })} />
                                 </div>

                                 {/* Quick Actions */}
                                 <div className="pt-6 border-t border-slate-100">
                                    <button className="w-full py-4 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98]">
                                       Modify Permissions
                                    </button>
                                 </div>
                              </div>
                           )}
                        </aside>

                        {/* Main Content Area */}
                        <main className="flex-1 p-8 lg:p-12 space-y-12">
                           {detailLoading ? (
                              <div className="flex flex-col items-center justify-center h-96">
                                 <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4" />
                                 <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Compiling Intelligence...</p>
                              </div>
                           ) : detailUser && (
                              <div className="space-y-16 animate-in fade-in slide-in-from-right-8 duration-700">
                                 
                                 {/* Overview Metrics */}
                                 <section>
                                    <SectionHeader title="Operational Overview" icon={<FaInfoCircle />} />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                       <MetricCard 
                                          label="Activity Volume" 
                                          value={detailUser.stats.total_orders} 
                                          unit="Total Orders"
                                          icon={<FaShoppingBag />} 
                                          color="indigo" 
                                       />
                                       <MetricCard 
                                          label="Financial Impact" 
                                          value={`₹${Number(detailUser.profile.type === 'Customer' ? detailUser.stats.total_spent : detailUser.stats.total_revenue).toLocaleString()}`} 
                                          unit={detailUser.profile.type === 'Customer' ? 'Lifetime Spent' : 'Gross Revenue'}
                                          icon={<FaRupeeSign />} 
                                          color="emerald" 
                                       />
                                       {detailUser.profile.type === 'Seller' && (
                                          <MetricCard 
                                             label="Asset Count" 
                                             value={detailUser.stats.total_products} 
                                             unit="Active Listings"
                                             icon={<FaBoxOpen />} 
                                             color="blue" 
                                          />
                                       )}
                                    </div>
                                 </section>

                                 {/* Seller Onboarding & Documents */}
                                 {detailUser.profile.type === 'Seller' && (
                                    <>
                                       <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                          <div>
                                             <SectionHeader title="Compliance & Identity" icon={<FaFileAlt />} />
                                             <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
                                                <DataRow label="GST Identification" value={detailUser.profile.gstin} />
                                                <DataRow label="Permanent Account Number (PAN)" value={detailUser.profile.pan} />
                                                <DataRow label="Aadhar Identity" value={detailUser.profile.aadhar} />
                                             </div>
                                          </div>
                                          <div>
                                             <SectionHeader title="Settlement Channel" icon={<FaUniversity />} />
                                             <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
                                                <DataRow label="Beneficiary Name" value={detailUser.profile.account_holder_name} />
                                                <DataRow label="Financial Institution" value={detailUser.profile.bank_name} />
                                                <DataRow label="Account Configuration" value={detailUser.profile.account_number} mask />
                                                <DataRow label="Routing Code (IFSC)" value={detailUser.profile.ifsc_code} />
                                             </div>
                                          </div>
                                       </section>

                                       <section>
                                          <SectionHeader title="Fulfillment Center" icon={<FaMapMarkerAlt />} />
                                          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex items-start gap-6">
                                             <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                                                <FaMapMarkerAlt size={24} />
                                             </div>
                                             <div>
                                                <h6 className="text-slate-900 font-black text-sm mb-1 uppercase tracking-tighter">Primary Dispatch Point</h6>
                                                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                                   {detailUser.profile.address1}, {detailUser.profile.address2 ? `${detailUser.profile.address2}, ` : ''}
                                                   <br />
                                                   {detailUser.profile.city}, {detailUser.profile.state} — <span className="font-mono text-slate-900">{detailUser.profile.pincode}</span>
                                                </p>
                                             </div>
                                          </div>
                                       </section>
                                    </>
                                 )}

                                 {/* Recent Transactions Table */}
                                 <section>
                                    <div className="flex items-center justify-between mb-8">
                                       <SectionHeader title="Transactional Intelligence" icon={<FaClipboardList />} noMargin />
                                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Feed: Last 10</span>
                                    </div>
                                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                                       <table className="w-full text-left border-collapse">
                                          <thead>
                                             <tr className="bg-slate-50 border-b border-slate-200">
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference ID</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeline</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Audit Status</th>
                                             </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100">
                                             {detailUser.orders.map(o => (
                                                <tr key={o.order_id} className="hover:bg-slate-50/50 transition-colors group">
                                                   <td className="px-8 py-6">
                                                      <span className="font-mono font-black text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">#{o.order_id}</span>
                                                   </td>
                                                   <td className="px-8 py-6">
                                                      <p className="text-xs font-bold text-slate-900">
                                                         {new Date(o.placed_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                                                      </p>
                                                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                                                         {new Date(o.placed_at).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
                                                      </p>
                                                   </td>
                                                   <td className="px-8 py-6 text-right">
                                                      <span className="font-black text-sm text-slate-900">₹{Number(o.total_amount).toLocaleString()}</span>
                                                   </td>
                                                   <td className="px-8 py-6 text-right">
                                                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border inline-block ${STATUS_STYLE[o.order_status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                         {o.order_status}
                                                      </span>
                                                   </td>
                                                </tr>
                                             ))}
                                             {detailUser.orders.length === 0 && (
                                                <tr>
                                                   <td colSpan="4" className="px-8 py-20 text-center">
                                                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                                         <FaBoxOpen className="text-slate-200 text-2xl" />
                                                      </div>
                                                      <p className="text-slate-400 font-bold text-sm">No transaction audit trail available</p>
                                                   </td>
                                                </tr>
                                             )}
                                          </tbody>
                                       </table>
                                    </div>
                                 </section>

                              </div>
                           )}
                        </main>
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
}

function SidebarLink({ icon, label, value, mono }) {
   return (
      <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
         <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:text-slate-900 transition-all shrink-0">
            {icon}
         </div>
         <div className="min-w-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className={`text-sm font-bold text-slate-900 truncate ${mono ? 'font-mono' : ''}`}>{value}</p>
         </div>
      </div>
   );
}

function MetricCard({ label, value, unit, icon, color }) {
   const colors = {
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      blue: 'bg-blue-50 text-blue-600 border-blue-100',
   };

   return (
      <div className={`p-8 rounded-3xl border ${colors[color]} flex flex-col items-center text-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 shadow-sm`}>
         <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
            {React.cloneElement(icon, { size: 40 })}
         </div>
         <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">{label}</span>
         <div className="text-3xl font-black tracking-tighter mb-1">{value}</div>
         <span className="text-[10px] font-bold opacity-80">{unit}</span>
      </div>
   );
}

function SectionHeader({ title, icon, noMargin }) {
   return (
      <div className={`flex items-center gap-3 ${noMargin ? '' : 'mb-8'}`}>
         <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/10">
            {icon}
         </div>
         <h4 className="text-xl font-black text-slate-900 tracking-tight">{title}</h4>
      </div>
   );
}

function DataRow({ label, value, mask }) {
   const displayValue = mask && value ? value.replace(/.(?=.{4})/g, '*') : (value || 'NOT_FOUND');
   return (
      <div className="flex items-center justify-between px-8 py-5 hover:bg-slate-50 transition-colors">
         <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
         <span className={`text-sm font-bold ${value ? 'text-slate-900' : 'text-rose-500 font-black italic'} ${mask || label.includes('PAN') ? 'font-mono' : ''}`}>
            {displayValue}
         </span>
      </div>
   );
}
