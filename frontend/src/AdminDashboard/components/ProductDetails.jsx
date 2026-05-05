import React, { useState } from "react";
import axios from "axios";
import { FaArrowLeft, FaBoxOpen, FaEdit, FaTrashAlt, FaCalendarAlt, FaBarcode, FaTags, FaInfoCircle } from "react-icons/fa";

export default function ProductDetails({ product, onBack, onEdit, onDeleteComplete }) {
   const [mainImage, setMainImage] = useState(product?.images?.[0] || null);

   if (!product) return null;

   const handleDelete = async () => {
      if (window.confirm(`Are you sure you want to decommission product ${product.product_id}?`)) {
         try {
            const res = await axios.delete(`http://localhost:5000/api/admin/delete-product/${product.product_id}`);
            if (res.data.success) {
               onDeleteComplete();
            }
         } catch (err) {
            alert("Deletion failed: " + err.message);
         }
      }
   };

   return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
         {/* Header */}
         <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
               <button 
                  onClick={onBack}
                  className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-all shadow-sm active:scale-95"
               >
                  <FaArrowLeft />
               </button>
               <div>
                  <h3 className="text-2xl font-bold text-stone-900 tracking-tight">Product Details</h3>
                  <p className="text-sm text-stone-500 font-medium">Detailed specifications and operational status for <span className="text-stone-900 font-bold">{product.product_id}</span></p>
               </div>
            </div>
            <div className="flex gap-3">
               {!product.isStatic ? (
                  <>
                     <button 
                        onClick={() => onEdit(product)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50 transition-all"
                     >
                        <FaEdit className="text-indigo-500" /> Edit
                     </button>
                     <button 
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 text-rose-600 font-bold text-sm hover:bg-rose-600 hover:text-white transition-all"
                     >
                        <FaTrashAlt /> Delete
                     </button>
                  </>
               ) : (
                  <div className="px-5 py-2.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                     <FaBoxOpen className="text-stone-300" /> System Asset (Read-Only)
                  </div>
               )}
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Visuals & Core Specs */}
            <div className="lg:col-span-1 space-y-8">
               <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden text-center">
                  <div className="aspect-square rounded-[2rem] bg-stone-50 border border-stone-100 mb-6 flex items-center justify-center overflow-hidden">
                     {mainImage ? (
                        <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
                     ) : (
                        <FaBoxOpen className="text-stone-200 text-6xl" />
                     )}
                  </div>
                  <h4 className="text-xl font-black text-stone-900 leading-tight mb-2">{product.name}</h4>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                     {product.category_name || "Uncategorized"}
                  </div>
               </div>

               <div className="bg-stone-900 p-8 rounded-[2.5rem] shadow-xl text-white space-y-6">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Financial Matrix</span>
                     <FaTags className="text-indigo-400" />
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-end border-b border-white/5 pb-4">
                        <span className="text-xs font-medium text-stone-400">Current Valuation</span>
                        <span className="text-2xl font-black text-white">₹{Number(product.price).toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-stone-400">MRP</span>
                        <span className="text-sm font-bold text-stone-500 line-through">₹{Number(product.mrp).toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center text-emerald-400">
                        <span className="text-xs font-medium opacity-80">Discount Yield</span>
                        <span className="text-sm font-black">-{product.mrp > 0 ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0}%</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Column: In-depth Details */}
            <div className="lg:col-span-2 space-y-8">
               <div className="bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-sm space-y-10">
                  <section className="space-y-4">
                     <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">
                        <FaInfoCircle /> Narrative / Overview
                     </div>
                     <p className="text-stone-600 leading-relaxed text-sm font-medium">
                        {product.description || "No detailed description available for this asset."}
                     </p>
                  </section>

                  <div className="grid grid-cols-2 gap-8 pt-6 border-t border-stone-50">
                     <section className="space-y-5">
                        <div className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                           <FaBarcode /> Technical Identity
                        </div>
                        <div className="space-y-3">
                           <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-stone-400 uppercase mb-0.5">Global SKU</span>
                              <span className="text-sm font-black text-stone-900 tracking-tight">{product.sku || "N/A"}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-stone-400 uppercase mb-0.5">Merchant Signature</span>
                              <span className="text-sm font-black text-stone-900 tracking-tight">{product.seller_name || "ElectroShop Core"}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-stone-400 uppercase mb-0.5">Brand Authority</span>
                              <span className="text-sm font-black text-stone-900 tracking-tight">{product.brand || "Generic"}</span>
                           </div>
                        </div>
                     </section>

                     <section className="space-y-5">
                        <div className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
                           <FaCalendarAlt /> Operational Metrics
                        </div>
                        <div className="space-y-3">
                           <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-stone-400 uppercase mb-0.5">Inventory Status</span>
                              <span className={`text-sm font-black ${product.stock_quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                 {product.stock_quantity > 0 ? `${product.stock_quantity} Units Available` : 'Depleted'}
                              </span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-stone-400 uppercase mb-0.5">Asset State</span>
                              <span className="text-sm font-black text-stone-900 tracking-tight">
                                 {product.is_active ? 'Active Listing' : 'Inactive / Archive'}
                              </span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-stone-400 uppercase mb-0.5">Market Visibility</span>
                              <span className="text-sm font-black text-stone-900 tracking-tight">
                                 {product.is_featured ? 'Homepage Featured' : 'Standard Catalog'}
                              </span>
                           </div>
                        </div>
                     </section>
                  </div>

                  <section className="pt-8 border-t border-stone-50">
                     <div className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-6">
                        Media Assets
                     </div>
                     <div className="flex flex-wrap gap-4">
                        {product.images?.map((img, i) => (
                           <div 
                              key={i} 
                              onClick={() => setMainImage(img)}
                              className={`w-24 h-24 rounded-2xl border overflow-hidden shadow-sm hover:scale-105 transition-all cursor-pointer ${mainImage === img ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-stone-100'}`}
                           >
                              <img src={img} alt="" className="w-full h-full object-cover" />
                           </div>
                        ))}
                     </div>
                  </section>
               </div>
            </div>
         </div>
      </div>
   );
}
