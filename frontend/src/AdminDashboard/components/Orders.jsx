import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaShoppingBag, FaSearch, FaChevronRight, FaCalendarAlt, FaUser, FaWallet } from "react-icons/fa";
import OrderDetailView from "./OrderDetailView";

export default function Orders() {
   const [ordersData, setOrdersData] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");
   const [view, setView] = useState("list"); // "list" or "detail"
   const [selectedOrder, setSelectedOrder] = useState(null);
   const [orderItems, setOrderItems] = useState([]);
   const [orderHistory, setOrderHistory] = useState([]);

   const [currentPage, setCurrentPage] = useState(1);
   const ordersPerPage = 8;

   const fetchOrders = () => {
      setLoading(true);
      axios.get("http://localhost:5000/api/admin/orders")
         .then(res => {
            if (res.data.success) setOrdersData(res.data.orders);
            setLoading(false);
         })
         .catch(err => {
            console.error("Orders fetch error", err);
            setLoading(false);
         });
   };

   useEffect(() => {
      fetchOrders();
   }, []);

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

   const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
         case 'confirmed': return 'text-blue-600 bg-blue-50 border-blue-100';
         case 'shipped': return 'text-amber-600 bg-amber-50 border-amber-100';
         case 'delivered': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
         case 'cancelled': return 'text-rose-600 bg-rose-50 border-rose-100';
         default: return 'text-stone-600 bg-stone-50 border-stone-100';
      }
   };

   const filteredOrders = ordersData.filter(o => 
      o.order_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
   );

   const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
   const currentOrders = filteredOrders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage);

   if (view === "detail" && selectedOrder) {
      return (
         <OrderDetailView 
            order={selectedOrder} 
            items={orderItems} 
            history={orderHistory} 
            onBack={() => setView("list")} 
         />
      );
   }

   if (loading && ordersData.length === 0) return (
      <div className="flex flex-col items-center justify-center h-64 animate-pulse">
         <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
         <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Processing Database...</p>
      </div>
   );

   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex justify-between items-center">
            <div>
               <h3 className="text-xl font-bold text-stone-900 tracking-tight">Order Management</h3>
               <p className="text-xs text-stone-500 font-medium">Track and monitor all transactions across the platform.</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="relative">
                  <input 
                     type="text" 
                     placeholder="Search ID or Customer..." 
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
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Order Identifier</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Customer Details</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Placed On</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Net Value</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Status</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-50">
                  {currentOrders.map((order) => (
                     <tr key={order.order_id} className="hover:bg-stone-50/50 transition-colors group">
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors border border-stone-100">
                                 <FaShoppingBag size={14} />
                              </div>
                              <span className="text-sm font-bold text-stone-900 group-hover:text-indigo-600 transition-colors">#{order.order_id}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-stone-900">{order.customer_name}</span>
                              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">{order.customer_email}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-2 text-stone-500">
                              <FaCalendarAlt size={10} className="text-stone-300" />
                              <span className="text-[11px] font-bold">{new Date(order.placed_at).toLocaleDateString()}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-1.5 text-stone-900">
                              <FaWallet size={10} className="text-stone-300" />
                              <span className="text-sm font-black">₹{Number(order.total_amount).toLocaleString()}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(order.order_status)}`}>
                              {order.order_status}
                           </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                           <button 
                              onClick={() => handleViewOrder(order.order_id)}
                              className="w-8 h-8 rounded-lg bg-stone-50 text-stone-400 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm group-hover:scale-110"
                           >
                              <FaChevronRight size={10} />
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>

            {filteredOrders.length > 0 ? (
               <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                     Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, filteredOrders.length)} of {filteredOrders.length} Orders
                  </div>
                  <div className="flex items-center gap-2">
                     <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className={`px-3 py-1.5 rounded-lg border border-stone-200 text-[10px] font-bold transition-all ${currentPage === 1 ? 'bg-stone-50 text-stone-300' : 'bg-white text-stone-600 hover:bg-stone-100 active:scale-95'}`}
                     >
                        Previous
                     </button>
                     <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                           <button 
                              key={i}
                              onClick={() => setCurrentPage(i + 1)}
                              className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${currentPage === i + 1 ? 'bg-stone-900 text-white' : 'text-stone-400 hover:bg-stone-100'}`}
                           >
                              {i + 1}
                           </button>
                        ))}
                     </div>
                     <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className={`px-3 py-1.5 rounded-lg border border-stone-200 text-[10px] font-bold transition-all ${currentPage === totalPages ? 'bg-stone-50 text-stone-300' : 'bg-white text-stone-600 hover:bg-stone-100 active:scale-95'}`}
                     >
                        Next
                     </button>
                  </div>
               </div>
            ) : (
               <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-stone-100 shadow-inner">
                     <FaShoppingBag className="text-stone-200 text-3xl" />
                  </div>
                  <h4 className="text-stone-900 font-bold text-lg">No Orders Found</h4>
                  <p className="text-stone-400 font-medium text-sm mt-1">We couldn't find any orders matching your search.</p>
               </div>
            )}
         </div>
      </div>
   );
}
