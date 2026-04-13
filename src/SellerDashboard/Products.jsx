import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaDownload, FaBox, FaPlus, FaPen, FaTrash } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import AddProduct from "./AddProduct";

export default function Products({
  inventoryProducts,
  setInventoryProducts,
  selectedCategory,
  setSelectedCategory,
  globalSearch,
  downloadReceipt
}) {
  const [isAddingNewPage, setIsAddingNewPage] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "", stock: "", img: "" });

  if (isAddingNewPage) {
    return (
      <AddProduct 
        initialData={editingIndex !== null ? inventoryProducts[editingIndex] : null}
        onBack={() => {
          setIsAddingNewPage(false);
          setEditingIndex(null);
        }} 
        onAddProduct={(newProduct) => {
          if (editingIndex !== null) {
            const updated = [...inventoryProducts];
            updated[editingIndex] = {
              ...updated[editingIndex],
              ...newProduct,
              category: newProduct.type || updated[editingIndex].category,
              img: newProduct.images && newProduct.images.length > 0 ? newProduct.images[0] : updated[editingIndex].img
            };
            setInventoryProducts(updated);
          } else {
            setInventoryProducts([...inventoryProducts, {
              ...newProduct,
              id: Date.now(),
              category: newProduct.type,
              img: newProduct.images && newProduct.images.length > 0 ? newProduct.images[0] : ''
            }]);
          }
          setIsAddingNewPage(false);
          setEditingIndex(null);
        }}
      />
    );
  }

  const handleEditClick = (product, idx) => {
    setEditingIndex(idx);
    setIsAddingNewPage(true);
  };

  const handleDeleteProduct = (idx) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const updated = [...inventoryProducts];
      updated.splice(idx, 1);
      setInventoryProducts(updated);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[9px] font-semibold">Product Management</span>
          </div>
          <h1 className="text-4xl font-semibold text-stone-900">
            Product Details
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-stone-100/50 p-1.5 rounded-[2rem] border border-stone-200/50 backdrop-blur-sm">
          {['All', ...new Set(inventoryProducts.map(p => p.category))].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-semibold   transition-all ${selectedCategory === cat
                ? 'bg-stone-900 text-amber-500 shadow-xl shadow-stone-900/20'
                : 'text-stone-400 hover:text-stone-900 hover:bg-white'
                }`}
            >
              {cat}
            </button>
          ))}
          <div className="w-px h-6 bg-stone-200/60 mx-1 hidden sm:block" />
          <button
            onClick={() => setIsAddingNewPage(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-amber-500 hover:bg-stone-800 rounded-xl font-semibold text-[10px] transition-all shadow-xl shadow-stone-900/10 active:scale-95 ml-auto sm:ml-0"
          >
            <FaPlus size={10} /> Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-2xl shadow-stone-200/40 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-stone-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

          <table className="w-full text-left border-collapse relative z-10">
            <thead>
              <tr className="border-b border-stone-50">
                <th className="px-12 py-8 text-[10px] font-semibold text-stone-900">Asset Details</th>
                <th className="px-12 py-8 text-[10px] font-semibold text-stone-900">Sector</th>
                <th className="px-12 py-8 text-[10px] font-semibold text-stone-900">Availability</th>
                <th className="px-6 py-8 text-[10px] font-semibold text-stone-900">Valuation</th>
                <th className="px-12 py-8 text-right text-[10px] font-semibold text-stone-900">Operational</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {[...inventoryProducts]
                .reverse()
                .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
                .filter(p => p.name.toLowerCase().includes(globalSearch.toLowerCase()) || p.category.toLowerCase().includes(globalSearch.toLowerCase()))
                .map((p, i) => {
                  const originalIndex = inventoryProducts.findIndex(item => item.name === p.name);
                  return (
                    <motion.tr
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={originalIndex}
                      className="group hover:bg-stone-50/50 transition-all cursor-default"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-lg bg-stone-950 p-2 overflow-hidden flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform border border-stone-800">
                            <img src={p.img} alt={p.name} className="w-full rounded-md h-full object-contain" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-stone-900 text-sm block tracking-tight">{p.name}</span>
                              {p.type && <span className="text-[8px] font-semibold bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-md">{p.type}</span>}
                            </div>
                            <span className="text-[9px] font-semibold text-stone-300">UID: #{(8192 + originalIndex).toString(16)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="bg-stone-50 text-stone-900 border border-stone-100 px-4 py-1.5 rounded-full text-[9px] font-semibold">{p.category}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] font-bold text-stone-400">{p.stock} Units</span>
                            <span className={`text-[9px] font-semibold ${p.stock > 10 ? 'text-green-500' : p.stock > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                              {p.stock > 10 ? 'Healthy' : p.stock > 0 ? 'Critical' : 'Depleted'}
                            </span>
                          </div>
                          <div className="w-32 h-1 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${p.stock > 10 ? 'bg-green-500' : p.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(100, (p.stock / 50) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-7 py-6">
                        <span className="font-semibold text-stone-900 text-base">{p.price}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => downloadReceipt(p)}
                            className="p-3 bg-stone-50 text-stone-900 border border-stone-100 rounded-2xl hover:bg-stone-900 hover:text-white transition-all shadow-sm group/btn"
                          >
                            <FaDownload size={12} className="group-hover/btn:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleEditClick(p, originalIndex)}
                            className="p-3 bg-stone-50 text-stone-900 border border-stone-100 rounded-2xl hover:bg-amber-600 hover:text-white transition-all shadow-sm group/edit"
                          >
                            <FaPen size={12} className="group-hover/edit:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(originalIndex)}
                            className="p-3 bg-stone-50 text-stone-900 border border-stone-100 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm group/delete"
                          >
                            <FaTrash size={12} className="group-hover/delete:scale-110 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
