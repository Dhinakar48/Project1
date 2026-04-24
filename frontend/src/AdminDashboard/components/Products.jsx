import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBoxOpen, FaPlus, FaSearch } from "react-icons/fa";
import AddProductForm from "./AddProductForm";
import ProductDetails from "./ProductDetails";

export default function Products() {
   const [productsData, setProductsData] = useState([]);
   const [searchQuery, setSearchQuery] = useState("");
   const [loading, setLoading] = useState(true);
   const [view, setView] = useState("list"); // "list", "add", or "inspect"
   const [selectedProduct, setSelectedProduct] = useState(null);

   const [currentPage, setCurrentPage] = useState(1);
   const productsPerPage = 5;

   const fetchProducts = () => {
      setLoading(true);
      axios.get("http://localhost:5000/api/admin/products")
         .then(res => {
            if (res.data.success) setProductsData(res.data.products);
            setLoading(false);
         })
         .catch(err => {
            console.error("Products fetch error", err);
            setLoading(false);
         });
   };

   useEffect(() => {
      fetchProducts();
   }, []);

   useEffect(() => {
      setCurrentPage(1);
   }, [searchQuery]);

   const filteredProducts = productsData.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
   const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
   const currentProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

   if (view === "add") {
      return (
         <AddProductForm 
            initialData={selectedProduct}
            onBack={() => {
               setView("list");
               setSelectedProduct(null);
            }} 
            onComplete={() => {
               setView("list");
               setSelectedProduct(null);
               fetchProducts();
            }} 
         />
      );
   }

   if (view === "inspect" && selectedProduct) {
      return (
         <ProductDetails 
            product={selectedProduct} 
            onBack={() => {
               setView("list");
               setSelectedProduct(null);
            }} 
            onEdit={(prod) => {
               setSelectedProduct(prod);
               setView("add");
            }}
            onDeleteComplete={() => {
               setView("list");
               setSelectedProduct(null);
               fetchProducts();
            }}
         />
      );
   }

   if (loading && productsData.length === 0) return (
      <div className="flex flex-col items-center justify-center h-64 animate-pulse">
         <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
         <p className="text-stone-400 font-bold">Fetching Inventory...</p>
      </div>
   );

   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex justify-between items-center">
            <div>
               <h3 className="text-xl font-bold text-stone-900 tracking-tight">Inventory Management</h3>
               <p className="text-xs text-stone-500 font-medium">Manage your platform's global catalog and stock levels.</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="relative">
                  <input 
                     type="text" 
                     placeholder="Search products..." 
                     className="w-64 pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all focus:w-80 shadow-sm"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <FaBoxOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
               </div>
               <button 
                  onClick={() => setView("add")}
                  className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-all shadow-lg active:scale-95"
               >
                  <FaPlus className="text-[10px]" /> Add Product
               </button>
            </div>
         </div>

         <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Product Info</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Merchant</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Availability</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">List Price</th>
                     <th className="px-6 py-5 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-stone-50">
                  {currentProducts.map((prod) => (
                     <tr key={prod.product_id} className="hover:bg-stone-50/50 transition-colors group">
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center overflow-hidden border border-stone-100 group-hover:border-indigo-200 transition-colors shadow-sm">
                                 {prod.images && prod.images[0] ? <img src={prod.images[0]} alt="" className="w-full h-full object-cover" /> : <FaBoxOpen className="text-stone-300" />}
                              </div>
                              <div>
                                 <div className="text-sm font-bold text-stone-900 group-hover:text-indigo-600 transition-colors">{prod.name}</div>
                                 <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">ID: {prod.product_id}</div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 text-stone-600 text-[11px] font-bold border border-stone-100 shadow-sm">
                              {prod.seller_name || 'System Admin'}
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex flex-col gap-1.5">
                              <div className={`text-[11px] font-black ${prod.stock_quantity < 10 ? 'text-rose-500' : 'text-emerald-600'}`}>
                                 {prod.stock_quantity} Units <span className="opacity-50 ml-1">in Stock</span>
                              </div>
                              <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                 <div className={`h-full ${prod.stock_quantity < 10 ? 'bg-rose-500' : 'bg-emerald-500'} transition-all duration-1000`} style={{ width: `${Math.min(prod.stock_quantity, 100)}%` }} />
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex flex-col">
                              <span className="text-sm font-black text-stone-900">₹{Number(prod.price).toLocaleString()}</span>
                              {prod.mrp > prod.price && (
                                 <span className="text-[10px] text-stone-400 line-through">₹{Number(prod.mrp).toLocaleString()}</span>
                              )}
                           </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                           <button 
                              onClick={() => {
                                 setSelectedProduct(prod);
                                 setView("inspect");
                              }}
                              className="px-5 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                           >
                              Inspect
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            
            {/* Pagination UI */}
            {filteredProducts.length > 0 ? (
               <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                     Showing {((currentPage - 1) * productsPerPage) + 1} to {Math.min(currentPage * productsPerPage, filteredProducts.length)} of {filteredProducts.length} Entries
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
                     <FaBoxOpen className="text-stone-200 text-3xl" />
                  </div>
                  <h4 className="text-stone-900 font-bold text-lg">No Items Detected</h4>
                  <p className="text-stone-400 font-medium text-sm mt-1">We couldn't find any products matching your current criteria.</p>
               </div>
            )}
         </div>
      </div>
   );
}
