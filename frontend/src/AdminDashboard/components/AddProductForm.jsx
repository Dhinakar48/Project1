import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaArrowLeft, FaCheckCircle, FaTimes, FaImage } from "react-icons/fa";

export default function AddProductForm({ onBack, onComplete, initialData }) {
   const [categories, setCategories] = useState([]);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [formData, setFormData] = useState({
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price || "",
      mrp: initialData?.mrp || "",
      stock_quantity: initialData?.stock_quantity || "",
      category_id: initialData?.category_id || "",
      new_category_name: "",
      brand: initialData?.brand || "",
      sku: initialData?.sku || "",
      images: initialData?.images || [],
      discount: initialData?.discount || 0,
      is_featured: initialData?.is_featured || false,
      is_active: initialData?.is_active !== undefined ? initialData.is_active : true
   });

   useEffect(() => {
      axios.get("http://localhost:5000/api/admin/categories")
         .then(res => {
            if (res.data.success) setCategories(res.data.categories);
         })
         .catch(err => console.error("Categories fetch error", err));
   }, []);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
         const url = initialData 
            ? `http://localhost:5000/api/admin/update-product/${initialData.product_id}`
            : "http://localhost:5000/api/admin/add-product";
         
         const method = initialData ? 'put' : 'post';
         const res = await axios[method](url, formData);
         
         if (res.data.success) {
            onComplete();
         }
      } catch (err) {
         alert("Operation failed: " + (err.response?.data?.message || err.message));
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
               <button 
                  onClick={onBack}
                  className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-all shadow-sm active:scale-95"
               >
                  <FaArrowLeft />
               </button>
               <div>
                  <h3 className="text-2xl font-bold text-stone-900 tracking-tight">{initialData ? "Update Asset Specs" : "Add New Product"}</h3>
                  <p className="text-sm text-stone-500 font-medium">{initialData ? "Refining metadata for " + initialData.product_id : "Create a new entry in your global inventory catalog."}</p>
               </div>
            </div>
            <div className="flex gap-3">
               <button 
                  onClick={onBack}
                  className="px-6 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50 transition-all"
               >
                  Discard
               </button>
               <button 
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="px-6 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-sm hover:bg-stone-800 transition-all shadow-lg flex items-center gap-2"
               >
                  {isSubmitting ? (
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                     <><FaCheckCircle className="text-emerald-400" /> {initialData ? "Commit Changes" : "Publish Product"}</>
                  )}
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
               <section className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm space-y-6">
                  <h4 className="text-sm font-bold text-stone-900 border-b border-stone-50 pb-4 tracking-tight">Basic Information</h4>
                  <div className="space-y-4">
                     <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block ml-1">Product Title</label>
                        <input 
                           required
                           type="text"
                           className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50/30 text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                           placeholder="e.g. Sony WH-1000XM5 Wireless Noise Canceling Headphones"
                           value={formData.name}
                           onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block ml-1">Detailed Description</label>
                        <textarea 
                           required
                           rows="6"
                           className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50/30 text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none resize-none"
                           placeholder="Enter product specifications, features, and detailed info..."
                           value={formData.description}
                           onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                     </div>
                  </div>
               </section>

               <section className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm space-y-6">
                  <h4 className="text-sm font-bold text-stone-900 border-b border-stone-50 pb-4 tracking-tight">Pricing & Inventory</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block ml-1">Selling Price (₹)</label>
                        <input 
                           required type="number"
                           className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50/30 text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                           placeholder="0.00"
                           value={formData.price}
                           onChange={(e) => setFormData({...formData, price: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block ml-1">MRP (₹)</label>
                        <input 
                           required type="number"
                           className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50/30 text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                           placeholder="0.00"
                           value={formData.mrp}
                           onChange={(e) => setFormData({...formData, mrp: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block ml-1">Current Stock</label>
                        <input 
                           required type="number"
                           className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50/30 text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                           placeholder="e.g. 50"
                           value={formData.stock_quantity}
                           onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block ml-1">SKU Number</label>
                        <input 
                           type="text"
                           className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50/30 text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                           placeholder="SKU-XXXX-XXXX"
                           value={formData.sku}
                           onChange={(e) => setFormData({...formData, sku: e.target.value})}
                        />
                     </div>
                  </div>
               </section>
            </div>

            <div className="space-y-8">
               <section className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm space-y-6">
                  <h4 className="text-sm font-bold text-stone-900 border-b border-stone-50 pb-4 tracking-tight">Classification</h4>
                  <div className="space-y-4">
                     <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block ml-1">Category</label>
                        <select 
                           required
                           className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50/30 text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none appearance-none"
                           value={formData.category_id}
                           onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                        >
                           <option value="">Select Category</option>
                           {categories.map(cat => (
                              <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                           ))}
                           <option value="new" className="text-indigo-600 font-bold">+ Add New Category</option>
                        </select>
                     </div>

                     {formData.category_id === 'new' && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                           <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2 block ml-1">New Category Name</label>
                           <input 
                              required type="text"
                              className="w-full px-5 py-4 rounded-2xl border border-indigo-100 bg-indigo-50/30 text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                              placeholder="e.g. Smart Home Gadgets"
                              value={formData.new_category_name}
                              onChange={(e) => setFormData({...formData, new_category_name: e.target.value})}
                           />
                        </div>
                     )}
                     <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block ml-1">Brand</label>
                        <input 
                           required type="text"
                           className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50/30 text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                           placeholder="Sony, Apple, etc."
                           value={formData.brand}
                           onChange={(e) => setFormData({...formData, brand: e.target.value})}
                        />
                     </div>
                  </div>
               </section>

               <section className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm space-y-6">
                  <h4 className="text-sm font-bold text-stone-900 border-b border-stone-50 pb-4 tracking-tight">Media Gallery</h4>
                  <div className="space-y-4">
                     <div className="relative group">
                        <input 
                           type="text"
                           className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50/30 text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                           placeholder="Paste Image URL & Enter"
                           onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.target.value) {
                                 e.preventDefault();
                                 setFormData({...formData, images: [...formData.images, e.target.value]});
                                 e.target.value = '';
                              }
                           }}
                        />
                        <FaImage className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-300" />
                     </div>
                     <div className="grid grid-cols-3 gap-3">
                        {formData.images.map((img, i) => (
                           <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                              <button 
                                 type="button"
                                 onClick={() => setFormData({...formData, images: formData.images.filter((_, idx) => idx !== i)})}
                                 className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                 <FaTimes />
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
               </section>

               <section className="bg-stone-900 p-8 rounded-[2.5rem] shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-bold text-white tracking-tight">Featured Listing</span>
                     <input 
                        type="checkbox"
                        className="w-6 h-6 accent-indigo-500 rounded-lg"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                     />
                  </div>
                  <p className="text-[10px] text-stone-400 leading-relaxed">Featured products will be highlighted on the main storefront and homepage banners.</p>
               </section>
            </div>
         </div>
      </div>
   );
}
