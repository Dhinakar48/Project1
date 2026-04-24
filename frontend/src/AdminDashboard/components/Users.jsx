import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUsers, FaUserShield, FaStore, FaSearch, FaEllipsisV, FaEnvelope, FaPhone, FaCheckCircle, FaTimesCircle, FaBan, FaToggleOn, FaToggleOff } from "react-icons/fa";

export default function Users() {
   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");
   const [filter, setFilter] = useState("All");
   const [activeMenu, setActiveMenu] = useState(null);

   const fetchUsers = () => {
      setLoading(true);
      axios.get("http://localhost:5000/api/admin/all-users")
         .then(res => {
            if (res.data.success) setUsers(res.data.users);
            setLoading(false);
         })
         .catch(err => {
            console.error("Users fetch error", err);
            setLoading(false);
         });
   };

   useEffect(() => {
      fetchUsers();
   }, []);

   const handleToggleStatus = (userId, type, currentStatus) => {
      axios.patch("http://localhost:5000/api/admin/toggle-user-status", {
         userId,
         type,
         isActive: !currentStatus
      }).then(res => {
         if (res.data.success) {
            fetchUsers();
            setActiveMenu(null);
         }
      }).catch(err => console.error("Toggle status error", err));
   };

   const filteredUsers = users.filter(u => {
      const matchesSearch = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || u.id.toLowerCase().includes(searchQuery.toLowerCase());
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
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
               <h3 className="text-xl font-bold text-stone-900 tracking-tight">Identity & Access Management</h3>
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

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
               <div key={user.id} className="bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden">
                  {/* Status Badge */}
                  <div className="absolute top-6 left-6">
                     <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border flex items-center gap-1 ${user.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                        {user.is_active ? <FaCheckCircle size={8} /> : <FaTimesCircle size={8} />}
                        {user.is_active ? 'Active' : 'Blocked'}
                     </span>
                  </div>

                  {/* Options Menu */}
                  <div className="absolute top-6 right-6">
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
                     <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl shadow-inner overflow-hidden mb-4 ${user.type === 'Seller' ? 'bg-indigo-50 text-indigo-500' : 'bg-emerald-50 text-emerald-500'}`}>
                        {user.image ? (
                           <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                           user.type === 'Seller' ? <FaStore /> : <FaUsers />
                        )}
                     </div>
                     <div>
                        <div className="text-base font-bold text-stone-900 group-hover:text-indigo-600 transition-colors">{user.name}</div>
                        <div className={`text-[9px] font-black uppercase tracking-widest mt-1 px-3 py-1 rounded-full inline-block ${user.type === 'Seller' ? 'bg-indigo-500 text-white shadow-indigo-200' : 'bg-stone-900 text-white shadow-stone-200'} shadow-lg`}>
                           {user.type}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3 bg-stone-50/50 p-4 rounded-3xl border border-stone-100">
                     <div className="flex items-center gap-3 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer group/item">
                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-xs shadow-sm group-hover/item:text-indigo-500 transition-colors">
                           <FaEnvelope />
                        </div>
                        <span className="text-xs font-bold truncate">{user.email}</span>
                     </div>
                     <div className="flex items-center gap-3 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer group/item">
                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-xs shadow-sm group-hover/item:text-indigo-500 transition-colors">
                           <FaPhone />
                        </div>
                        <span className="text-xs font-bold">{user.phone || 'No phone recorded'}</span>
                     </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-stone-50 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Joined On</span>
                        <span className="text-[11px] font-bold text-stone-900">{new Date(user.created_at).toLocaleDateString()}</span>
                     </div>
                     <div className="flex flex-col text-right">
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">User ID</span>
                        <span className="text-[11px] font-mono font-bold text-stone-900">{user.id}</span>
                     </div>
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
      </div>
   );
}
