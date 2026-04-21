import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBoxOpen, FaEllipsisV } from "react-icons/fa";
import axios from "axios";

export default function Orders({ globalSearch }) {
  const [filter, setFilter] = useState("All");
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Shipped': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'Processing': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'Delivered': return 'bg-green-100 text-green-600 border-green-200';
      case 'Pending': return 'bg-stone-100 text-stone-600 border-stone-200';
      default: return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      const sellerData = JSON.parse(localStorage.getItem("sellerUser") || "{}");
      const sellerId = sellerData.seller_id || sellerData.id;
      if (sellerId) {
        try {
          const res = await axios.get(`http://localhost:5000/seller-orders/${sellerId}`);
          setOrders(res.data.map(o => ({
             id: o.order_id,
             date: new Date(o.placed_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
             time: new Date(o.placed_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
             name: o.shipping_name || o.customer_name,
             email: o.customer_email,
             item: o.product_name,
             image: o.product_images && o.product_images.length > 0 ? o.product_images[0] : "/placeholder-product.png",
             qty: o.quantity,
             amount: `₹${parseFloat(o.total_price).toLocaleString()}`,
             unitPrice: `₹${parseFloat(o.unit_price).toLocaleString()}`,
             status: o.item_status || o.order_status,
             statusColor: getStatusColor(o.item_status || o.order_status)
          })));
        } catch (err) {
          console.error("Error fetching seller orders:", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders
    .filter(o => filter === "All" ? true : o.status === filter)
    .filter(o => 
      o.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
      o.item.toLowerCase().includes(globalSearch.toLowerCase()) || 
      o.id.toLowerCase().includes(globalSearch.toLowerCase())
    );

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-1000" onClick={() => setActiveActionMenu(null)}>
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600">
             <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
             <span className="text-[9px] font-semibold">Order Management</span>
          </div>
          <h1 className="text-4xl font-semibold text-stone-900">
            Orders Details
          </h1>
        </div>

        {/* FILTER CHIPS */}
        <div className="flex flex-wrap items-center gap-2">
           {['All', 'Processing', 'Shipped', 'Delivered', 'Pending'].map(f => (
              <button 
                key={f}
                onClick={(e) => { e.stopPropagation(); setFilter(f); setActiveActionMenu(null); }}
                className={`px-4 py-2 rounded-xl text-[10px] font-semibold transition-all ${filter === f ? 'bg-stone-900 text-white shadow-xl' : 'bg-white text-stone-400 border border-stone-100 hover:border-stone-300 shadow-sm'}`}
              >
                {f}
              </button>
           ))}
        </div>
      </div>

      {/* ROBUST TABLE STRUCTURE */}
      <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-2xl shadow-stone-200/40 overflow-hidden relative" style={{ minHeight: '400px' }}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-stone-50 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
        
        <div className="overflow-x-auto relative z-10 w-full">
          <table className="w-full text-left min-w-[900px] relative">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/50 backdrop-blur-md">
                <th className="px-8 py-6 text-[9px] font-semibold text-stone-400">Transaction ID</th>
                <th className="px-8 py-6 text-[9px] font-semibold text-stone-400">Client Profile</th>
                <th className="px-8 py-6 text-[9px] font-semibold text-stone-400">Acquired Asset</th>
                <th className="px-8 py-6 text-[9px] font-semibold text-stone-400">Financials</th>
                <th className="px-8 py-6 text-[9px] font-semibold text-stone-400">Status Protocol</th>
                <th className="px-8 py-6 text-right text-[9px] font-semibold text-stone-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
               <AnimatePresence>
                 {filteredOrders.map((order, i) => (
                    <motion.tr 
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className="group hover:bg-stone-50/50 transition-colors cursor-default relative"
                    >
                      <td className="px-8 py-6">
                        <span className="font-semibold text-stone-900 text-sm tracking-tight block">{order.id}</span>
                        <span className="text-[9px] font-bold text-stone-400 mt-1">{order.date} • {order.time}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-sm font-semibold text-stone-500">
                              {order.name.charAt(0)}
                           </div>
                           <div>
                             <span className="font-bold text-stone-900 text-sm tracking-tight block">{order.name}</span>
                             <span className="text-[10px] font-bold text-stone-400 mt-0.5 block">{order.email}</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-3">
                           <div className="w-12 h-12 bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex-shrink-0">
                             <img src={order.image} alt={order.item} className="w-full h-full object-cover mix-blend-multiply" />
                           </div>
                           <div>
                             <span className="font-bold text-stone-900 text-sm tracking-tight block">{order.item}</span>
                             <span className="text-[9px] font-semibold text-stone-400 mt-1 block">Qty: {order.qty}</span>
                           </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-bold text-stone-900 text-sm block">{order.amount}</span>
                        {order.qty > 1 && <span className="text-[10px] text-stone-400 font-medium">{order.unitPrice} / unit</span>}
                      </td>
                      <td className="px-8 py-6">
                         <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${order.statusColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'Processing' ? 'animate-pulse' : ''} bg-current`} />
                            <span className="text-[9px] font-semibold">{order.status}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right relative">
                        <div className="flex justify-end">
                           <button 
                             onClick={(e) => { e.stopPropagation(); setActiveActionMenu(activeActionMenu === order.id ? null : order.id); }}
                             className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-white border border-transparent hover:border-stone-200 hover:shadow-sm transition-all relative z-10"
                           >
                             <FaEllipsisV size={12} />
                           </button>

                           <AnimatePresence>
                             {activeActionMenu === order.id && (
                               <motion.div 
                                 initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                 animate={{ opacity: 1, scale: 1, y: 0 }}
                                 exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                 transition={{ duration: 0.2 }}
                                 className="absolute right-12 top-2 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden z-[50]"
                               >
                                 <div className="p-2 flex flex-col items-start gap-1">
                                    <button className="w-full text-left px-4 py-2.5 text-[10px] font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-colors">Advance Status</button>
                                    <button className="w-full text-left px-4 py-2.5 text-[10px] font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-colors">Download Invoice</button>
                                    <div className="h-px w-full bg-stone-100 my-1" />
                                    <button className="w-full text-left px-4 py-2.5 text-[10px] font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">Terminate Order</button>
                                 </div>
                               </motion.div>
                             )}
                           </AnimatePresence>
                        </div>
                      </td>
                    </motion.tr>
                 ))}
               </AnimatePresence>
               {filteredOrders.length === 0 && (
                 <tr>
                   <td colSpan="6" className="px-8 py-24 text-center">
                     <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                        <FaBoxOpen size={24} />
                     </div>
                     <h3 className="font-semibold text-stone-900 text-sm mb-1">No Orders Found</h3>
                     <p className="text-[10px] font-bold text-stone-400">Try adjusting your search or filters.</p>
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
