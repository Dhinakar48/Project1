import React, { useState } from 'react';
import axios from 'axios';
import { FaArrowLeft, FaBox, FaUser, FaMapMarkerAlt, FaTruck, FaCreditCard, FaHistory, FaChevronDown, FaCheckCircle } from 'react-icons/fa';

export default function OrderDetailView({ order: initialOrder, items, history: initialHistory, onBack, onStatusUpdate }) {
   const [order, setOrder] = useState(initialOrder);
   const [history, setHistory] = useState(initialHistory);
   const [updating, setUpdating] = useState(false);
   const [successMsg, setSuccessMsg] = useState("");
   
   if (!order) return null;

   const statuses = ['Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];

   const handleStatusUpdate = async (newStatus) => {
      if (newStatus === order.order_status) return;
      
      setUpdating(true);
      try {
         const res = await axios.patch('http://localhost:5000/api/order/status', {
            orderId: order.order_id,
            status: newStatus,
            changedBy: 'Administrator',
            notes: `Status manually updated to ${newStatus} by Admin.`
         });
         
         if (res.data.success) {
            // Update local state instead of reloading
            setOrder(prev => ({ ...prev, order_status: newStatus }));
            
            // Add to local history immediately
            const newHistoryEntry = {
               status: newStatus,
               changed_at: new Date().toISOString(),
               notes: `Status manually updated to ${newStatus} by Admin.`,
               changed_by: 'Administrator'
            };
            setHistory(prev => [newHistoryEntry, ...prev]);
            
            if (onStatusUpdate) onStatusUpdate(); // Notify parent to refresh list
            
            setSuccessMsg(`Status updated to ${newStatus}`);
            setTimeout(() => setSuccessMsg(""), 3000);
         }
      } catch (err) {
         console.error("Status update failed", err);
         alert("Failed to update status. Please try again.");
      } finally {
         setUpdating(false);
      }
   };

   const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
         case 'confirmed': return 'bg-blue-50 text-blue-600 border-blue-100';
         case 'shipped': return 'bg-amber-50 text-amber-600 border-amber-100';
         case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
         case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
         default: return 'bg-stone-50 text-stone-600 border-stone-100';
      }
   };

   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex items-center gap-4">
            <button 
               onClick={onBack}
               className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-all shadow-sm active:scale-90"
            >
               <FaArrowLeft size={14} />
            </button>
            <div>
               <h3 className="text-xl font-bold text-stone-900 tracking-tight">Order #{order.order_id}</h3>
               <p className="text-xs text-stone-500 font-medium">Placed on {new Date(order.placed_at).toLocaleString()}</p>
            </div>
            
            {successMsg && (
               <div className="ml-4 px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                  <FaCheckCircle /> {successMsg}
               </div>
            )}

            <div className="ml-auto flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Update Status:</span>
                  <div className="relative group/select">
                     <select 
                        disabled={updating}
                        value={order.order_status}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-2 rounded-xl bg-white border border-stone-200 text-[11px] font-black uppercase tracking-widest text-stone-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all cursor-pointer disabled:opacity-50"
                     >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                     <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-[8px] pointer-events-none" />
                  </div>
               </div>
               <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.order_status)} shadow-sm`}>
                  {order.order_status}
               </span>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Items & Summary */}
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden p-8">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <FaBox />
                     </div>
                     <h4 className="text-lg font-bold text-stone-900">Order Items</h4>
                  </div>
                  
                  <div className="space-y-4">
                     {items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 rounded-3xl border border-stone-50 hover:border-indigo-100 transition-all group">
                           <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center overflow-hidden border border-stone-100 group-hover:border-indigo-100 transition-colors">
                              {item.product_images && item.product_images[0] ? (
                                 <img src={item.product_images[0]} alt="" className="w-full h-full object-cover" />
                              ) : (
                                 <FaBox className="text-stone-300" />
                              )}
                           </div>
                           <div className="flex-1">
                              <div className="text-sm font-bold text-stone-900">{item.product_name}</div>
                              <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">
                                 Seller: <span className="text-indigo-600">{item.seller_name || 'System'}</span>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="text-sm font-black text-stone-900">₹{Number(item.unit_price).toLocaleString()}</div>
                              <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Qty: {item.quantity}</div>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-stone-50 space-y-3">
                     <div className="flex justify-between text-sm">
                        <span className="text-stone-500 font-medium">Subtotal</span>
                        <span className="text-stone-900 font-bold">₹{Number(order.subtotal).toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-stone-500 font-medium">Discount</span>
                        <span className="text-rose-500 font-bold">-₹{Number(order.discount_amount).toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-stone-500 font-medium">Shipping & Fees</span>
                        <span className="text-stone-900 font-bold">₹{Number(Number(order.shipping_charge) + Number(order.platform_fee)).toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between pt-4 border-t border-stone-50">
                        <span className="text-base font-bold text-stone-900">Total Amount</span>
                        <span className="text-xl font-black text-stone-900">₹{Number(order.total_amount).toLocaleString()}</span>
                     </div>
                  </div>
               </div>

               {/* History */}
               <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden p-8 flex flex-col max-h-[400px]">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <FaHistory />
                     </div>
                     <h4 className="text-lg font-bold text-stone-900">Status History</h4>
                  </div>
                  
                  <div className="overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
                     <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-100">
                        {history.filter(log => log.status?.toLowerCase() === order.order_status?.toLowerCase()).map((log, idx) => (
                           <div key={idx} className="relative">
                              <div className="absolute -left-8 top-1.5 w-7 h-7 rounded-full bg-white border-2 border-stone-100 flex items-center justify-center z-10">
                                 <div className="w-2 h-2 rounded-full bg-stone-300" />
                              </div>
                              <div className="flex flex-col">
                                 <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-stone-900">{log.status}</span>
                                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{new Date(log.changed_at).toLocaleString()}</span>
                                 </div>
                                 <p className="text-xs text-stone-500 mt-1 font-medium">{log.notes}</p>
                                 <div className="mt-1 text-[10px] font-bold text-indigo-600 uppercase tracking-widest">By {log.changed_by}</div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Column: Customer & Shipping */}
            <div className="space-y-6">
               <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden p-8">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <FaUser />
                     </div>
                     <h4 className="text-lg font-bold text-stone-900">Customer</h4>
                  </div>
                  <div className="space-y-1">
                     <div className="text-sm font-bold text-stone-900">{order.customer_name}</div>
                     <div className="text-[11px] text-stone-500 font-medium">{order.customer_email}</div>
                     <div className="text-[11px] text-stone-500 font-medium">ID: {order.customer_id}</div>
                  </div>
               </div>

               <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden p-8">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                        <FaMapMarkerAlt />
                     </div>
                     <h4 className="text-lg font-bold text-stone-900">Shipping Address</h4>
                  </div>
                  <div className="space-y-2">
                     <div className="text-sm font-bold text-stone-900">{order.shipping_name}</div>
                     <div className="text-[11px] text-stone-500 font-medium leading-relaxed">
                        {order.address1}<br />
                        {order.address2 && <>{order.address2}<br /></>}
                        {order.city}, {order.state} - {order.pincode}
                     </div>
                     <div className="pt-2 flex items-center gap-2 text-[11px] font-bold text-stone-900">
                        <FaTruck className="text-stone-400" /> {order.phone}
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden p-8">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
                        <FaCreditCard />
                     </div>
                     <h4 className="text-lg font-bold text-stone-900">Payment</h4>
                  </div>
                  <div className="space-y-3">
                     <div className="flex justify-between items-center">
                        <span className="text-[11px] text-stone-500 font-bold uppercase tracking-widest">Status</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${order.payment_status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                           {order.payment_status}
                        </span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-stone-500 font-medium">Method</span>
                        <span className="text-stone-900 font-bold uppercase">{order.payment_method}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
