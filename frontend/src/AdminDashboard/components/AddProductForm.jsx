import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaArrowLeft, FaCheckCircle, FaTimes, FaImage, FaPlus, FaTrash } from "react-icons/fa";

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
      is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
      weight: initialData?.weight || "",
      height: initialData?.height || "",
      width: initialData?.width || "",
      breadth: initialData?.breadth || "",
      seller_id: (() => {
         const admin = JSON.parse(localStorage.getItem('admin') || '{}');
         return initialData?.seller_id || admin.id || "ADM001";
      })(),
      specifications: (() => {
         const raw = initialData?.specifications;
         if (!raw) return [{ key: "", value: "", price: "", stock: "", sku: "" }];
         if (Array.isArray(raw)) return raw.length > 0 ? raw : [{ key: "", value: "", price: "", stock: "", sku: "" }];
         try { const parsed = JSON.parse(raw); return Array.isArray(parsed) && parsed.length > 0 ? parsed : [{ key: "", value: "", price: "", stock: "", sku: "" }]; }
         catch { return [{ key: "", value: "", price: "", stock: "", sku: "" }]; }
      })()
   });

   useEffect(() => {
      axios.get("http://localhost:5000/api/admin/categories")
         .then(res => {
            if (res.data.success) setCategories(res.data.categories);
         })
         .catch(err => console.error("Categories fetch error", err));
   }, []);

   const handleSpecChange = (index, field, value) => {
      const newSpecs = [...formData.specifications];
      newSpecs[index][field] = value;
      setFormData({...formData, specifications: newSpecs});
   };

   const addSpecification = () => {
      setFormData({
         ...formData, 
         specifications: [...formData.specifications, { key: "", value: "", price: "", stock: "", sku: "" }]
      });
   };

   const removeSpecification = (index) => {
      setFormData({
         ...formData, 
         specifications: formData.specifications.filter((_, i) => i !== index)
      });
   };

   const handleImageUpload = (e) => {
      const files = Array.from(e.target.files);
      Promise.all(
         files.map((file) => {
            return new Promise((resolve) => {
               const reader = new FileReader();
               reader.onloadend = () => resolve(reader.result);
               reader.readAsDataURL(file);
            });
         })
      ).then((base64Images) => {
         setFormData(prev => ({...prev, images: [...prev.images, ...base64Images]}));
      });
   };

   const removeImage = (index) => {
      setFormData(prev => ({
         ...prev,
         images: prev.images.filter((_, i) => i !== index)
      }));
   };

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
                  <div className="space-y-6">
                     {/* Row 1: Price, MRP, Stock, Weight */}
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                           <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block ml-1">Selling Price (₹) *</label>
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
                           <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block ml-1">Stock Qty *</label>
                           <input 
                              required type="number"
                              className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50/30 text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                              placeholder="0"
                              value={formData.stock_quantity}
                              onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block ml-1">Weight (grams)</label>
                           <input 
                              type="number" step="0.01"
                              className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50/30 text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                              placeholder="0.00"
                              value={formData.weight}
                              onChange={(e) => setFormData({...formData, weight: e.target.value})}
                           />
                        </div>
                     </div>

                     {/* Row 2: Height, Width, Breadth */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                           <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block ml-1">Height (mm)</label>
                           <input 
                              type="number" step="0.01"
                              className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50/30 text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                              placeholder="0.00"
                              value={formData.height}
                              onChange={(e) => setFormData({...formData, height: e.target.value})}
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block ml-1">Width (mm)</label>
                           <input 
                              type="number" step="0.01"
                              className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50/30 text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                              placeholder="0.00"
                              value={formData.width}
                              onChange={(e) => setFormData({...formData, width: e.target.value})}
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 block ml-1">Breadth (mm)</label>
                           <input 
                              type="number" step="0.01"
                              className="w-full px-5 py-4 rounded-2xl border border-stone-200 bg-stone-50/30 text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                              placeholder="0.00"
                              value={formData.breadth}
                              onChange={(e) => setFormData({...formData, breadth: e.target.value})}
                           />
                        </div>
                     </div>
                  </div>
               </section>

               <section className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-stone-50 pb-4">
                     <h4 className="text-sm font-bold text-stone-900 tracking-tight">Specifications & Variants</h4>
                     <button 
                        type="button"
                        onClick={addSpecification}
                        className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-100 transition-all uppercase tracking-widest shadow-sm"
                     >
                        <FaPlus size={8} /> Add Variation
                     </button>
                  </div>
                  
                  <div className="space-y-4">
                     {formData.specifications.map((spec, index) => (
                        <div key={index} className="flex flex-wrap md:flex-nowrap items-end gap-3 p-5 bg-stone-50/50 border border-stone-200 rounded-[2rem] group transition-all hover:bg-white hover:shadow-xl hover:shadow-stone-200/20 relative">
                           <div className="flex-[2] min-w-[120px]">
                              <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-1 block">Key (e.g. Color)</label>
                              <input 
                                 type="text" placeholder="Attribute" 
                                 value={spec.key} onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                                 className="w-full p-3 bg-white border border-stone-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-sm font-bold shadow-sm"
                              />
                           </div>
                           <div className="flex-[2] min-w-[120px]">
                              <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-1 block">Value</label>
                              <input 
                                 type="text" placeholder="Value" 
                                 value={spec.value} onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                                 className="w-full p-3 bg-white border border-stone-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-sm font-bold shadow-sm"
                              />
                           </div>
                           <div className="flex-1 min-w-[90px]">
                              <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-1 block">Price (₹)</label>
                              <div className="relative">
                                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">₹</span>
                                 <input 
                                    type="number" placeholder="0" 
                                    value={spec.price} onChange={(e) => handleSpecChange(index, "price", e.target.value)}
                                    className="w-full pl-7 pr-3 py-3 bg-white border border-stone-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-sm font-bold shadow-sm"
                                 />
                              </div>
                           </div>
                           <div className="flex-1 min-w-[80px]">
                              <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-1 block">Stock</label>
                              <input 
                                 type="number" placeholder="Qty" 
                                 value={spec.stock} onChange={(e) => handleSpecChange(index, "stock", e.target.value)}
                                 className="w-full p-3 bg-white border border-stone-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-sm font-bold shadow-sm"
                              />
                           </div>
                           
                           {formData.specifications.length > 1 && (
                              <button 
                                 type="button" onClick={() => removeSpecification(index)}
                                 className="w-11 h-11 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all flex-shrink-0 shadow-sm border border-rose-100"
                              >
                                 <FaTrash size={12} />
                              </button>
                           )}
                        </div>
                     ))}
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

               <section className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm space-y-6">
                  <h4 className="text-sm font-bold text-stone-900 border-b border-stone-50 pb-4 tracking-tight">Media Gallery</h4>
                  
                  <div className="space-y-5">
                     <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-stone-200 rounded-[2rem] bg-stone-50/50 hover:bg-stone-50 hover:border-indigo-400 transition-all cursor-pointer group">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-stone-300 group-hover:text-indigo-500 group-hover:scale-110 transition-all shadow-sm mb-3">
                           <FaImage />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-stone-400 group-hover:text-indigo-600 transition-colors">Click to upload assets</span>
                        <span className="text-[9px] text-stone-400 mt-1">PNG, JPG, WEBP — Multi-select supported</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                     </label>

                     {formData.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                           {formData.images.map((img, i) => (
                              <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden border border-stone-100 shadow-sm bg-stone-50">
                                 <img src={img} alt="" className="w-full h-full object-contain p-2" />
                                 <button 
                                    type="button"
                                    onClick={() => removeImage(i)}
                                    className="absolute top-2 right-2 w-7 h-7 bg-white/90 text-rose-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-rose-500 hover:text-white"
                                 >
                                    <FaTimes size={10} />
                                 </button>
                              </div>
                           ))}
                        </div>
                     )}

                     <div className="pt-4 border-t border-stone-50">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1 mb-2 block">Or Paste Remote URL</label>
                        <div className="relative group">
                           <input 
                              type="text"
                              className="w-full px-5 py-3.5 rounded-xl border border-stone-100 bg-stone-50/30 text-xs focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none font-bold"
                              placeholder="https://example.com/image.jpg"
                              onKeyDown={(e) => {
                                 if (e.key === 'Enter' && e.target.value) {
                                    e.preventDefault();
                                    setFormData({...formData, images: [...formData.images, e.target.value]});
                                    e.target.value = '';
                                 }
                              }}
                           />
                           <FaPlus className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 text-[10px]" />
                        </div>
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
