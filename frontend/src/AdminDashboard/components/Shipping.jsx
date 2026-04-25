import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
   FaTruck, FaBox, FaCheckCircle, FaClock, FaSearch, 
   FaMapMarkerAlt, FaChevronRight, FaUser, FaCalendarDay, 
   FaPhoneAlt, FaShip, FaPlane, FaRoute, FaArrowRight,
   FaPrint, FaEnvelope, FaEllipsisV
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import OrderDetailView from "./OrderDetailView";

export default function Shipping() {
   const [shipments, setShipments] = useState([]);
   const [stats, setStats] = useState({ pending: 0, shipped: 0, delivered: 0, inTransit: 0 });
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");
   const [statusFilter, setStatusFilter] = useState("all");
   
   const [view, setView] = useState("list"); // "list" or "detail"
   const [selectedOrder, setSelectedOrder] = useState(null);
   const [orderItems, setOrderItems] = useState([]);
   const [orderHistory, setOrderHistory] = useState([]);

   const [currentPage, setCurrentPage] = useState(1);
   const ordersPerPage = 6;

   const fetchShippingData = () => {
      setLoading(true);
      Promise.all([
         axios.get("http://localhost:5000/api/admin/shipping-stats"),
         axios.get("http://localhost:5000/api/admin/shipments")
      ]).then(([statsRes, shipmentsRes]) => {
         if (statsRes.data.success) setStats(statsRes.data.stats);
         if (shipmentsRes.data.success) setShipments(shipmentsRes.data.shipments);
         setLoading(false);
      }).catch(err => {
         console.error("Shipping data fetch error", err);
         setLoading(false);
      });
   };

   useEffect(() => {
      fetchShippingData();
   }, []);

   useEffect(() => {
      setCurrentPage(1);
   }, [searchQuery, statusFilter]);

   const handleViewOrder = (orderId) => {
      setLoading(true);
      axios.get(`http://localhost:5000/api/admin/order-details/${orderId}`)
         .then(res => {
            if (res.data.success) {
               setSelectedOrder(res.data.order);
               setOrderItems(res.data.items);
               setOrderHistory(res.data.history);
               setView("detail");
            }
            setLoading(false);
         })
         .catch(err => {
            console.error("Order details fetch error", err);
            setLoading(false);
         });
   };

   const getStatusInfo = (status) => {
      switch (status?.toLowerCase()) {
         case 'delivered': return { color: 'emerald', label: 'Delivered', step: 4 };
         case 'shipped': return { color: 'blue', label: 'In Transit', step: 3 };
         case 'confirmed': return { color: 'amber', label: 'Confirmed', step: 2 };
         default: return { color: 'stone', label: 'Pending', step: 1 };
      }
   };

   // Map filter key → DB status values
   const STATUS_FILTER_MAP = {
      all: null,
      pickup: ['pending', 'confirmed'],
      transit: ['shipped'],
      outfordelivery: ['out for delivery', 'out_for_delivery'],
      delivered: ['delivered'],
   };

   const filteredShipments = shipments.filter(s => {
      const matchesSearch =
         s.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
         s.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         s.city?.toLowerCase().includes(searchQuery.toLowerCase());

      const allowedStatuses = STATUS_FILTER_MAP[statusFilter];
      const matchesStatus = !allowedStatuses ||
         allowedStatuses.includes(s.order_status?.toLowerCase());

      return matchesSearch && matchesStatus;
   });

   const totalPages = Math.ceil(filteredShipments.length / ordersPerPage);
   const currentShipments = filteredShipments.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage);

   if (view === "detail" && selectedOrder) {
      return (
         <OrderDetailView 
            order={selectedOrder} 
            items={orderItems} 
            history={orderHistory} 
            onBack={() => setView("list")} 
            onStatusUpdate={fetchShippingData}
         />
      );
   }

   if (loading && shipments.length === 0) return (
      <div className="flex flex-col items-center justify-center h-96">
         <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
         </div>
         <p className="text-stone-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-8 animate-pulse">Initializing Global Logistics...</p>
      </div>
   );

   return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#fafafa]">
         {/* Premium Header */}
         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm">
            <div>
               <h3 className="text-2xl font-black text-stone-900 tracking-tight">Shipment Management</h3>
               <p className="text-xs text-stone-500 font-bold uppercase tracking-widest mt-1">Enterprise Fleet Operations Dashboard</p>
            </div>
            
            <div className="flex items-center gap-4 w-full lg:w-auto">
               <div className="relative flex-1 lg:w-80">
                  <input 
                     type="text" 
                     placeholder="Search Tracking ID, Customer or City..." 
                     className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
               </div>
               <button className="p-3 bg-stone-900 text-white rounded-xl hover:bg-indigo-600 transition-all shadow-lg active:scale-95">
                  <FaPrint size={14} />
               </button>
            </div>
         </div>

         {/* Stats Row */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatusCard label="Awaiting Pick-up" value={stats.pending} icon={FaClock} color="amber" />
            <StatusCard label="In Transit" value={stats.inTransit} icon={FaRoute} color="indigo" />
            <StatusCard label="Out for Delivery" value={stats.shipped} icon={FaTruck} color="blue" />
            <StatusCard label="Delivered" value={stats.delivered} icon={FaCheckCircle} color="emerald" />
         </div>

         {/* Status Filter Tabs */}
         <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm px-6 py-4 flex items-center gap-3 overflow-x-auto">
            {[
               { key: 'all',          label: 'All Shipments', icon: FaBox,         color: 'stone' },
               { key: 'pickup',       label: 'Awaiting Pick-up', icon: FaClock,    color: 'amber' },
               { key: 'transit',      label: 'In Transit',    icon: FaRoute,       color: 'indigo' },
               { key: 'outfordelivery', label: 'Out for Delivery', icon: FaTruck,  color: 'blue' },
               { key: 'delivered',    label: 'Delivered',     icon: FaCheckCircle, color: 'emerald' },
            ].map(({ key, label, icon: Icon, color }) => {
               const active = statusFilter === key;
               const colorMap = {
                  stone:   active ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-50 text-stone-500 border-stone-100 hover:bg-stone-100',
                  amber:   active ? 'bg-amber-500 text-white border-amber-500'  : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100',
                  indigo:  active ? 'bg-indigo-600 text-white border-indigo-600': 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100',
                  blue:    active ? 'bg-blue-500 text-white border-blue-500'    : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100',
                  emerald: active ? 'bg-emerald-500 text-white border-emerald-500': 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100',
               };
               return (
                  <button
                     key={key}
                     onClick={() => setStatusFilter(key)}
                     className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all active:scale-95 ${colorMap[color]}`}
                  >
                     <Icon size={11} />
                     {label}
                  </button>
               );
            })}
         </div>

         {/* Professional Table */}
         <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-stone-50/50 border-b border-stone-100">
                     <tr>
                        <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">Shipment & Status</th>
                        <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">Recipient Info</th>
                        <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">Logistics Path</th>
                        <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">Progress</th>
                        <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                     {currentShipments.map((s) => {
                        const info = getStatusInfo(s.order_status);
                        return (
                           <tr key={s.order_id} className="hover:bg-stone-50/50 transition-all group">
                              <td className="px-8 py-8">
                                 <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border ${
                                       info.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                       info.color === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                       info.color === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                       'bg-stone-50 text-stone-600 border-stone-100'
                                    }`}>
                                       <FaBox size={18} />
                                    </div>
                                    <div>
                                       <div className="text-sm font-black text-stone-900 tracking-tight">#{s.order_id}</div>
                                       <div className={`text-[9px] font-black uppercase tracking-widest mt-1 inline-block px-2 py-0.5 rounded-md ${
                                          info.color === 'emerald' ? 'bg-emerald-100/50 text-emerald-700' :
                                          info.color === 'blue' ? 'bg-blue-100/50 text-blue-700' :
                                          info.color === 'amber' ? 'bg-amber-100/50 text-amber-700' :
                                          'bg-stone-100 text-stone-600'
                                       }`}>
                                          {info.label}
                                       </div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-8">
                                 <div className="flex flex-col">
                                    <span className="text-sm font-bold text-stone-900">{s.shipping_name || s.customer_name}</span>
                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">{s.customer_name}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-8">
                                 <div className="flex items-center gap-3">
                                    <div className="text-right">
                                       <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Origin</div>
                                       <div className="text-[11px] font-bold text-stone-900">Main Hub</div>
                                    </div>
                                    <FaArrowRight className="text-stone-300" size={10} />
                                    <div>
                                       <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Destination</div>
                                       <div className="text-[11px] font-bold text-stone-900">{s.city}</div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-8">
                                 <div className="w-48">
                                    <div className="flex justify-between text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2">
                                       <span>Phase {info.step}/4</span>
                                       <span>{info.step * 25}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden flex">
                                       {[1, 2, 3, 4].map((i) => (
                                          <div 
                                             key={i}
                                             className={`h-full flex-1 border-r border-white last:border-0 transition-all duration-500 ${
                                                i <= info.step ? (
                                                   info.color === 'emerald' ? 'bg-emerald-500' :
                                                   info.color === 'blue' ? 'bg-blue-500' :
                                                   info.color === 'amber' ? 'bg-amber-500' :
                                                   'bg-indigo-500'
                                                ) : 'bg-stone-100'
                                             }`}
                                          />
                                       ))}
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-8 text-right">
                                 <div className="flex items-center justify-end gap-2">
                                    <button 
                                       onClick={() => handleViewOrder(s.order_id)}
                                       className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                                    >
                                       Track
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>

            {/* Pagination */}
            {filteredShipments.length > 0 ? (
               <div className="px-8 py-6 bg-stone-50/50 border-t border-stone-100 flex items-center justify-between">
                  <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                     Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, filteredShipments.length)} of {filteredShipments.length} Entries
                  </div>
                  <div className="flex items-center gap-2">
                     <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className={`px-4 py-2 rounded-xl border border-stone-200 text-[10px] font-black uppercase tracking-widest transition-all ${currentPage === 1 ? 'bg-stone-50 text-stone-300' : 'bg-white text-stone-600 hover:bg-stone-100'}`}
                     >
                        Prev
                     </button>
                     <div className="flex items-center gap-1.5">
                        {[...Array(totalPages)].map((_, i) => (
                           <button 
                              key={i}
                              onClick={() => setCurrentPage(i + 1)}
                              className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-stone-900 text-white shadow-lg' : 'text-stone-400 hover:bg-stone-100'}`}
                           >
                              {i + 1}
                           </button>
                        ))}
                     </div>
                     <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className={`px-4 py-2 rounded-xl border border-stone-200 text-[10px] font-black uppercase tracking-widest transition-all ${currentPage === totalPages ? 'bg-stone-50 text-stone-300' : 'bg-white text-stone-600 hover:bg-stone-100'}`}
                     >
                        Next
                     </button>
                  </div>
               </div>
            ) : (
               <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                     <FaTruck className="text-stone-200 text-3xl" />
                  </div>
                  <h4 className="text-stone-900 font-bold text-lg">No Logistics Data Found</h4>
                  <p className="text-stone-400 font-medium text-sm mt-1">No active shipments matching your current filter.</p>
               </div>
            )}
         </div>
      </div>
   );
}

function StatusCard({ label, value, icon: Icon, color }) {
   const colors = {
      amber: 'text-amber-600 bg-amber-50 border-amber-100',
      indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      blue: 'text-blue-600 bg-blue-50 border-blue-100',
      emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100'
   };

   return (
      <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
         <div className="flex justify-between items-start relative z-10">
            <div>
               <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{label}</p>
               <h4 className="text-3xl font-black text-stone-900 tracking-tight">{value}</h4>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:rotate-12 ${colors[color]}`}>
               <Icon size={20} />
            </div>
         </div>
         <div className="mt-4 flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
            <FaArrowRight size={8} /> Active Channel
         </div>
      </div>
   );
}
