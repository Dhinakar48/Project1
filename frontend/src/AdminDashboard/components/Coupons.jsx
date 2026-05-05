import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTag, FaPlus, FaCheckCircle, FaTimesCircle, FaRegCalendarAlt, FaInfoCircle, FaTrash } from "react-icons/fa";

export default function Coupons() {
   const [coupons, setCoupons] = useState([]);
   const [isCreating, setIsCreating] = useState(false);
   const [loading, setLoading] = useState(true);

   // Form State
   const [title, setTitle] = useState('');
   const [description, setDescription] = useState('');
   const [code, setCode] = useState('');
   const [type, setType] = useState('Percentage');
   const [discountPercent, setDiscountPercent] = useState('');
   const [maxDiscount, setMaxDiscount] = useState('');
   const [minOrderValue, setMinOrderValue] = useState('');
   const [maxUsage, setMaxUsage] = useState('');
   const [validUntil, setValidUntil] = useState('');

   useEffect(() => {
      fetchCoupons();
   }, []);

   const fetchCoupons = async () => {
      try {
         const res = await axios.get("http://localhost:5000/api/admin/coupons");
         if (res.data.success) {
            setCoupons(res.data.coupons);
         }
      } catch (err) {
         console.error("Error fetching coupons:", err);
      } finally {
         setLoading(false);
      }
   };

   const handleCreateCoupon = async (e) => {
      e.preventDefault();
      try {
         const admin = JSON.parse(localStorage.getItem('admin') || '{}');
         const payload = {
            admin_id: admin.id || 'ADM001',
            title,
            description,
            code,
            type,
            discount_percent: discountPercent || null,
            max_discount: maxDiscount || null,
            min_order_value: minOrderValue || 0,
            max_usage: maxUsage || null,
            valid_until: validUntil || null
         };
         
         const res = await axios.post("http://localhost:5000/api/admin/coupons", payload);
         if (res.data.success) {
            fetchCoupons();
            setIsCreating(false);
            resetForm();
         }
      } catch (err) {
         console.error("Error creating coupon:", err);
         alert("Failed to create coupon");
      }
   };

   const resetForm = () => {
      setTitle('');
      setDescription('');
      setCode('');
      setType('Percentage');
      setDiscountPercent('');
      setMaxDiscount('');
      setMinOrderValue('');
      setMaxUsage('');
      setValidUntil('');
   };

   const toggleStatus = async (id, currentStatus) => {
      try {
         await axios.patch(`http://localhost:5000/api/admin/coupons/${id}`, {
            is_active: !currentStatus
         });
         fetchCoupons();
      } catch (err) {
         console.error("Error updating status:", err);
      }
   };

   const handleRemoveCoupon = async (id) => {
      if (!window.confirm("Are you sure you want to delete this coupon? This action cannot be undone.")) return;
      try {
         await axios.delete(`http://localhost:5000/api/admin/coupons/${id}`);
         fetchCoupons();
      } catch (err) {
         console.error("Error deleting coupon:", err);
         const msg = err.response?.data?.message || "Failed to delete coupon";
         alert(msg);
      }
   };

   if (isCreating) {
      return (
         <div className="bg-white min-h-[85vh] rounded-[2.5rem] shadow-sm border border-stone-100 p-10 flex flex-col">
            <div className="flex justify-between items-center border-b border-stone-100 pb-8 mb-8">
               <div>
                  <h3 className="text-3xl font-black tracking-tight text-stone-900">Design New Coupon</h3>
                  <p className="text-stone-500 font-medium mt-2">Configure the rules, limits, and display properties for your new promotion.</p>
               </div>
               <button onClick={() => setIsCreating(false)} className="w-12 h-12 bg-stone-50 hover:bg-stone-100 rounded-full flex items-center justify-center text-stone-500 transition-colors">
                  <FaTimesCircle className="text-2xl" />
               </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="flex-1 flex flex-col justify-between">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                     <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Internal Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-5 py-4 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" placeholder="e.g. Summer Mega Sale 2026" />
                     </div>
                     
                     <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Coupon Code *</label>
                        <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} required className="w-full bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-4 text-lg font-black text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase placeholder:text-indigo-300" placeholder="e.g. SUMMER50" />
                     </div>

                     <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Description / Terms</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows="5" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-5 py-4 text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none" placeholder="Provide terms or marketing copy for this coupon..."></textarea>
                     </div>
                  </div>

                  <div className="space-y-8 bg-stone-50 p-8 rounded-[2.5rem] border border-stone-100 h-fit">
                     <div className="grid grid-cols-2 gap-6">
                        <div>
                           <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Discount %</label>
                           <input type="number" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 15" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Max Discount (₹)</label>
                           <input type="number" value={maxDiscount} onChange={e => setMaxDiscount(e.target.value)} className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 500" />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div>
                           <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Min Order (₹)</label>
                           <input type="number" value={minOrderValue} onChange={e => setMinOrderValue(e.target.value)} className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Max Usage Limit</label>
                           <input type="number" value={maxUsage} onChange={e => setMaxUsage(e.target.value)} className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Leave blank for infinite" />
                        </div>
                     </div>

                     <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Valid Until (Expiry Date)</label>
                        <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                     </div>
                  </div>
               </div>

               <div className="pt-8 mt-8 border-t border-stone-100 flex justify-end gap-4">
                  <button type="button" onClick={() => setIsCreating(false)} className="px-8 py-4 text-sm font-bold text-stone-500 hover:text-stone-900 transition-colors">
                     Cancel
                  </button>
                  <button type="submit" className="bg-stone-900 hover:bg-black text-white px-10 py-4 rounded-xl text-sm font-bold shadow-xl shadow-stone-200 transition-all">
                     Activate Coupon
                  </button>
               </div>
            </form>
         </div>
      );
   }

   return (
      <div className="space-y-8 bg-[#fafafa] min-h-[85vh] rounded-3xl p-8">
         <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100">
            <div>
               <h3 className="text-2xl font-black text-stone-900 tracking-tight">Promotional Coupons</h3>
               <p className="text-sm font-medium text-stone-500 mt-1">Manage global platform discount codes, limits, and statuses.</p>
            </div>
            <button 
               onClick={() => setIsCreating(true)}
               className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
            >
               <FaPlus /> Create New Coupon
            </button>
         </div>

         {loading ? (
            <div className="flex justify-center items-center h-64">
               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
         ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
               {coupons.map(coupon => (
                  <div key={coupon.coupon_id} className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-xl hover:border-indigo-100 group min-h-[320px]">
                     {/* Left Section: Identity (Voucher Style) */}
                     <div className="bg-stone-900 text-white p-10 md:w-[35%] flex flex-col justify-between relative overflow-hidden shrink-0">
                        <div className="absolute -right-6 -top-6 text-stone-800 opacity-40 transform rotate-12 pointer-events-none">
                           <FaTag className="text-[12rem]" />
                        </div>
                        
                        <div className="relative z-10">
                           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 text-white text-[9px] font-black uppercase tracking-[0.2em] mb-6">
                              {coupon.type}
                           </div>
                           <h4 className="text-3xl font-black tracking-tighter leading-none mb-3 break-all">{coupon.code}</h4>
                           <p className="text-stone-400 text-[11px] font-bold uppercase tracking-widest">{coupon.title || 'Platform Offer'}</p>
                        </div>

                        <div className="relative z-10 pt-6 mt-6 border-t border-white/10">
                           <div className="text-[9px] font-bold text-stone-500 uppercase tracking-widest mb-1">Created By</div>
                           <div className="text-xs font-bold text-stone-200 truncate">{coupon.seller_name || 'Admin Authority'}</div>
                        </div>
                     </div>

                     {/* Right Section: Details & Metrics */}
                     <div className="p-10 md:w-[65%] flex flex-col justify-between bg-white relative">
                        {/* Header Actions */}
                        <div className="flex justify-between items-start mb-6">
                           <div>
                              <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${coupon.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                 {coupon.is_active ? 'Live & Active' : 'Inactive'}
                              </span>
                           </div>
                           <div className="flex items-center gap-2 bg-stone-50 p-1.5 rounded-2xl border border-stone-100">
                              <button 
                                 onClick={() => toggleStatus(coupon.coupon_id, coupon.is_active)} 
                                 className={`p-2 rounded-xl transition-all ${coupon.is_active ? 'hover:bg-rose-100 text-rose-500' : 'hover:bg-emerald-100 text-emerald-500'}`}
                              >
                                 {coupon.is_active ? 
                                    <FaTimesCircle size={18} title="Deactivate" /> : 
                                    <FaCheckCircle size={18} title="Activate" />
                                 }
                              </button>
                              <div className="w-px h-4 bg-stone-200 mx-1" />
                              <button 
                                 onClick={() => handleRemoveCoupon(coupon.coupon_id)} 
                                 className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors"
                              >
                                 <FaTrash size={16} title="Delete Coupon" />
                              </button>
                           </div>
                        </div>

                        {/* Description */}
                        <div className="flex-1">
                           {coupon.description ? (
                              <div className="mb-8">
                                 <h5 className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><FaInfoCircle size={10} /> Coupon Terms</h5>
                                 <p className="text-sm font-medium text-stone-600 leading-relaxed line-clamp-2">{coupon.description}</p>
                              </div>
                           ) : (
                              <div className="h-12" /> // Placeholder for consistent alignment
                           )}

                           {/* Metrics Grid */}
                           <div className="grid grid-cols-2 gap-8">
                              <div className="space-y-1">
                                 <h5 className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Benefit</h5>
                                 <p className="text-2xl font-black text-indigo-600 tracking-tight">
                                    {coupon.discount_percent ? `${coupon.discount_percent}%` : 'FIXED'} 
                                    <span className="text-xs ml-1 text-stone-400 font-bold uppercase">Off</span>
                                 </p>
                              </div>
                              <div className="space-y-1">
                                 <h5 className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Usage Limit</h5>
                                 <p className="text-xl font-black text-stone-900 tracking-tight">
                                    {coupon.used_count} <span className="text-xs text-stone-300 font-bold mx-1">/</span> {coupon.max_usage || '∞'}
                                 </p>
                              </div>
                              <div className="space-y-1">
                                 <h5 className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Min. Spend</h5>
                                 <p className="text-base font-black text-stone-800">₹{coupon.min_order_value || '0'}</p>
                              </div>
                              <div className="space-y-1">
                                 <h5 className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Max Cap</h5>
                                 <p className="text-base font-black text-stone-800">{coupon.max_discount ? `₹${coupon.max_discount}` : 'No Limit'}</p>
                              </div>
                           </div>
                        </div>

                        {/* Footer: Expiry */}
                        <div className="mt-8 pt-6 border-t border-stone-50 flex items-center justify-between text-[11px] font-bold">
                           <div className="flex items-center gap-2 text-stone-400">
                              <FaRegCalendarAlt size={12} />
                              <span className="uppercase tracking-widest">Validity:</span>
                           </div>
                           <span className={new Date(coupon.valid_until) < new Date() ? 'text-red-500' : 'text-stone-900'}>
                              {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'PERPETUAL'}
                           </span>
                        </div>
                     </div>
                  </div>
               ))}

               {coupons.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-stone-200 rounded-[3rem]">
                     <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaTag className="text-3xl text-stone-300" />
                     </div>
                     <h4 className="text-xl font-black text-stone-900 mb-2">No Active Promotions</h4>
                     <p className="text-stone-500">You haven't created any global coupons yet. Start driving sales now!</p>
                  </div>
               )}
            </div>
         )}
      </div>
   );
}
