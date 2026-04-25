import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTag, FaPlus, FaCheckCircle, FaTimesCircle, FaRegCalendarAlt, FaInfoCircle, FaStore, FaTrash } from "react-icons/fa";

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
         const seller = JSON.parse(localStorage.getItem('sellerUser') || '{}');
         if (!seller.id && !seller.seller_id) return;
         
         const sellerId = seller.id || seller.seller_id;
         const res = await axios.get(`http://localhost:5000/api/seller/coupons/${sellerId}`);
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
         const seller = JSON.parse(localStorage.getItem('sellerUser') || '{}');
         const sellerId = seller.id || seller.seller_id;
         
         const payload = {
            seller_id: sellerId,
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
         
         const res = await axios.post("http://localhost:5000/api/seller/coupons", payload);
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
         const seller = JSON.parse(localStorage.getItem('sellerUser') || '{}');
         const sellerId = seller.id || seller.seller_id;

         await axios.patch(`http://localhost:5000/api/seller/coupons/${id}`, {
            is_active: !currentStatus,
            seller_id: sellerId
         });
         fetchCoupons();
      } catch (err) {
         console.error("Error updating status:", err);
      }
   };

   const handleRemoveCoupon = async (id) => {
      if (!window.confirm("Are you sure you want to delete this coupon? This action cannot be undone.")) return;
      try {
         const seller = JSON.parse(localStorage.getItem('sellerUser') || '{}');
         const sellerId = seller.id || seller.seller_id;

         await axios.delete(`http://localhost:5000/api/seller/coupons/${id}`, {
            data: { seller_id: sellerId }
         });
         fetchCoupons();
      } catch (err) {
         console.error("Error deleting coupon:", err);
         alert("Failed to delete coupon");
      }
   };

   if (isCreating) {
      return (
         <div className="bg-white min-h-[85vh] rounded-[2.5rem] shadow-sm border border-stone-100 p-10 flex flex-col">
            <div className="flex justify-between items-center border-b border-stone-100 pb-8 mb-8">
               <div>
                  <h3 className="text-3xl font-black tracking-tight text-stone-900">Design Store Coupon</h3>
                  <p className="text-stone-500 font-medium mt-2">Set up a new discount code exclusively for your store's products.</p>
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
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-5 py-4 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" placeholder="e.g. End of Season Sale" />
                     </div>
                     
                     <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Coupon Code *</label>
                        <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} required className="w-full bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-4 text-lg font-black text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase placeholder:text-indigo-300" placeholder="e.g. STORE20" />
                     </div>

                     <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Description / Terms</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows="5" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-5 py-4 text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none" placeholder="Let customers know how to use this coupon..."></textarea>
                     </div>
                  </div>

                  <div className="space-y-8 bg-stone-50 p-8 rounded-[2.5rem] border border-stone-100 h-fit">
                     <div className="grid grid-cols-2 gap-6">
                        <div>
                           <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Discount %</label>
                           <input type="number" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 20" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Max Discount (₹)</label>
                           <input type="number" value={maxDiscount} onChange={e => setMaxDiscount(e.target.value)} className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 1000" />
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
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-xl text-sm font-bold shadow-xl shadow-indigo-200 transition-all">
                     Activate Store Coupon
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
               <h3 className="text-2xl font-black text-stone-900 tracking-tight">Store Coupons</h3>
               <p className="text-sm font-medium text-stone-500 mt-1">Design special offers and generate discount codes for your store.</p>
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
                  <div key={coupon.coupon_id} className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-xl hover:border-indigo-100 group">
                     {/* Left/Top Section: Identity */}
                     <div className="bg-gradient-to-br from-indigo-900 to-stone-900 text-white p-8 md:w-2/5 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 text-indigo-800 opacity-50 transform rotate-12">
                           <FaTag className="text-9xl" />
                        </div>
                        <div className="relative z-10 space-y-6">
                           <div>
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 text-white text-[10px] font-black uppercase tracking-widest mb-4">
                                 {coupon.type}
                              </div>
                              <h4 className="text-3xl font-black tracking-tight leading-none mb-2">{coupon.code}</h4>
                              <p className="text-indigo-200 text-sm font-medium">{coupon.title || 'Store Offer'}</p>
                           </div>
                           <div>
                              <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1 flex items-center gap-1"><FaStore /> Scope</div>
                              <div className="text-sm font-bold text-white">Store Exclusive</div>
                           </div>
                        </div>
                     </div>

                     {/* Right/Bottom Section: Details & Metrics */}
                     <div className="p-8 md:w-3/5 flex flex-col justify-between bg-white relative">
                        <div className="absolute top-6 right-6 flex items-center gap-2">
                           <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${coupon.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                              {coupon.is_active ? 'Active' : 'Expired / Inactive'}
                           </span>
                           <button onClick={() => toggleStatus(coupon.coupon_id, coupon.is_active)} className="p-2 rounded-xl hover:bg-stone-100 transition-colors">
                              {coupon.is_active ? 
                                 <FaTimesCircle className="text-rose-500 text-lg" title="Deactivate" /> : 
                                 <FaCheckCircle className="text-emerald-500 text-lg" title="Activate" />
                              }
                           </button>
                           <button onClick={() => handleRemoveCoupon(coupon.coupon_id)} className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors">
                              <FaTrash className="text-sm" title="Delete Coupon" />
                           </button>
                        </div>

                        <div className="space-y-6 mt-4 md:mt-0">
                           {coupon.description && (
                              <div>
                                 <h5 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-1"><FaInfoCircle /> Description</h5>
                                 <p className="text-sm font-medium text-stone-700">{coupon.description}</p>
                              </div>
                           )}

                           <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                              <div>
                                 <h5 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Discount</h5>
                                 <p className="text-xl font-black text-indigo-600">{coupon.discount_percent ? `${coupon.discount_percent}% OFF` : 'Custom'}</p>
                              </div>
                              <div>
                                 <h5 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Max Discount</h5>
                                 <p className="text-lg font-bold text-stone-900">{coupon.max_discount ? `₹${coupon.max_discount}` : 'No Limit'}</p>
                              </div>
                              <div>
                                 <h5 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Min Order</h5>
                                 <p className="text-lg font-bold text-stone-900">{coupon.min_order_value ? `₹${coupon.min_order_value}` : '₹0'}</p>
                              </div>
                              <div>
                                 <h5 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Usage Limit</h5>
                                 <p className="text-lg font-bold text-stone-900">{coupon.used_count} <span className="text-sm text-stone-400">/ {coupon.max_usage || '∞'}</span></p>
                              </div>
                           </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-stone-100 flex items-center gap-2 text-sm font-bold text-stone-500">
                           <FaRegCalendarAlt className="text-stone-400" />
                           Expires: <span className="text-stone-900">{coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Never Expires'}</span>
                        </div>
                     </div>
                  </div>
               ))}

               {coupons.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-stone-200 rounded-[3rem]">
                     <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaTag className="text-3xl text-stone-300" />
                     </div>
                     <h4 className="text-xl font-black text-stone-900 mb-2">No Store Coupons</h4>
                     <p className="text-stone-500">Create discount codes to incentivize your customers to buy more.</p>
                  </div>
               )}
            </div>
         )}
      </div>
   );
}
