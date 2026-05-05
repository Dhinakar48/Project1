import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaArrowLeft, FaPlus, FaTimes, FaImage, FaTrash } from "react-icons/fa";

export default function AddProduct({ onBack, onAddProduct, initialData, sellerId }) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(initialData ? {
    name: initialData.name || "",
    description: initialData.description || "",
    category_id: initialData.category_id || "",
    price: initialData.price || "",
    discountPrice: initialData.discountPrice || "",
    stock: initialData.stock_quantity || initialData.stock || "",
    sku: initialData.sku || "",
    mrp: initialData.mrp || initialData.price || "",
    brand: initialData.brand || "",
    weight: initialData.weight || "",
    height: initialData.height || "",
    width: initialData.width || "",
    breadth: initialData.breadth || "",
    status: initialData.status || "Active",
    featured: initialData.featured || false,
  } : {
    name: "",
    description: "",
    category_id: "",
    price: "",
    mrp: "",
    brand: "",
    weight: "",
    height: "",
    width: "",
    breadth: "",
    stock: "",
    sku: "",
    status: "Active",
    featured: false,
  });

  const [images, setImages] = useState(initialData && initialData.images ? initialData.images : []);
  const [specifications, setSpecifications] = useState(() => {
    if (initialData && initialData.specifications) {
      if (Array.isArray(initialData.specifications)) return initialData.specifications;
      try {
        const parsed = JSON.parse(initialData.specifications);
        return Array.isArray(parsed) ? parsed : [{ key: "", value: "", price: "", stock: "", sku: "" }];
      } catch (e) {
        return [{ key: "", value: "", price: "", stock: "", sku: "" }];
      }
    }
    return [{ key: "", value: "", price: "", stock: "", sku: "" }];
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/categories");
      setCategories(res.rows || res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    if (initialData && initialData.specifications) {
      if (Array.isArray(initialData.specifications)) {
        setSpecifications(initialData.specifications.length > 0 ? initialData.specifications : [{ key: "", value: "", price: "", stock: "", sku: "" }]);
      } else {
        try {
          const parsed = JSON.parse(initialData.specifications);
          setSpecifications(Array.isArray(parsed) && parsed.length > 0 ? parsed : [{ key: "", value: "", price: "", stock: "", sku: "" }]);
        } catch (e) {
          setSpecifications([{ key: "", value: "", price: "", stock: "", sku: "" }]);
        }
      }
    } else {
      setSpecifications([{ key: "", value: "", price: "", stock: "", sku: "" }]);
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
      setImages((prev) => [...prev, ...base64Images]);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: "", value: "", price: "", stock: "", sku: "" }]);
  };

  const removeSpecification = (index) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category_id) {
      alert("Please select a category");
      return;
    }

    const productPayload = {
      seller_id: sellerId,
      category_id: formData.category_id === "new" ? null : formData.category_id,
      new_category_name: formData.category_id === "new" ? formData.new_category_name : null,
      name: formData.name,
      description: formData.description,
      brand: formData.brand,
      sku: formData.sku,
      price: parseFloat(formData.price) || 0,
      mrp: parseFloat(formData.mrp) || parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock) || 0,
      weight: parseFloat(formData.weight) || 0,
      height: parseFloat(formData.height) || 0,
      width: parseFloat(formData.width) || 0,
      breadth: parseFloat(formData.breadth) || 0,
      images: images,
      is_active: formData.status === "Active",
      is_featured: formData.featured,
      specifications: specifications,
    };

    try {
      if (initialData) {
        console.log("Updating product:", initialData.product_id, productPayload);
        await axios.put(`http://localhost:5000/seller-update-product/${initialData.product_id}`, productPayload);
        alert("Product updated successfully!");
      } else {
        await axios.post("http://localhost:5000/seller-add-product", productPayload);
        alert("Product published successfully!");
      }

      if(onAddProduct) {
        onAddProduct();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save product: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8 pb-4"
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-stone-200 hover:bg-stone-50 transition-colors"
        >
          <FaArrowLeft className="text-stone-500" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-stone-900">{initialData ? "Edit Product" : "Add New Product"}</h1>
          <p className="text-sm font-medium text-stone-400">{initialData ? "Update the details of your existing item." : "Fill in the details to list a new item."}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Form Fields */}
        <div className="xl:col-span-2 space-y-8 bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm">
          
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-sm font-semibold text-stone-600 block">Product Name *</label>
                <input 
                  type="text" name="name" 
                  value={formData.name} onChange={handleInputChange} required
                  placeholder="e.g. Sony Alpha A7 IV"
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
              
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-sm font-semibold text-stone-600 block">Description *</label>
                <textarea 
                  name="description" rows="4" 
                  value={formData.description} onChange={handleInputChange} required
                  placeholder="Detailed product description..."
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-600 block">Product Category *</label>
                  <select 
                    name="category_id" 
                    value={formData.category_id} onChange={handleInputChange} required
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                  >
                    <option value="" disabled>Select a Category</option>
                    {categories.map(cat => (
                      <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                    ))}
                    <option value="new">+ Add New Category...</option>
                  </select>
                </div>

                {formData.category_id === "new" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-semibold text-amber-600 block">New Category Name *</label>
                    <input 
                      type="text" name="new_category_name" 
                      value={formData.new_category_name || ""} 
                      onChange={handleInputChange} required
                      placeholder="e.g. Smart Watches"
                      className="w-full p-4 bg-amber-50/30 border border-amber-200 rounded-2xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder:text-stone-300"
                    />
                  </motion.div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-600 block">SKU / Product ID</label>
                <input 
                  type="text" name="sku" 
                  value={formData.sku} onChange={handleInputChange}
                  placeholder="e.g. SNY-A7IV-001"
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-600 block">Brand</label>
                <input 
                  type="text" name="brand" 
                  value={formData.brand} onChange={handleInputChange}
                  placeholder="e.g. Sony"
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-5 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-600 block">Selling Price (₹) *</label>
                <input 
                  type="number" name="price" 
                  value={formData.price} onChange={handleInputChange} required
                  min="0" placeholder="0.00"
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-600 block">MRP (₹)</label>
                <input 
                  type="number" name="mrp" 
                  value={formData.mrp} onChange={handleInputChange}
                  min="0" placeholder="0.00"
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-600 block">Stock Qty *</label>
                <input 
                  type="number" name="stock" 
                  value={formData.stock} onChange={handleInputChange} required
                  min="0" placeholder="0"
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-600 block">Weight (grams)</label>
                <input 
                  type="number" name="weight" step="0.01"
                  value={formData.weight} onChange={handleInputChange}
                  min="0" placeholder="0.00"
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-600 block">Height (mm)</label>
                <input 
                  type="number" name="height" step="0.01"
                  value={formData.height} onChange={handleInputChange}
                  min="0" placeholder="0.00"
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-600 block">Width (mm)</label>
                <input 
                  type="number" name="width" step="0.01"
                  value={formData.width} onChange={handleInputChange}
                  min="0" placeholder="0.00"
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-600 block">Breadth (mm)</label>
                <input 
                  type="number" name="breadth" step="0.01"
                  value={formData.breadth} onChange={handleInputChange}
                  min="0" placeholder="0.00"
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-5 pt-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-bold text-stone-900">Specifications</h3>
              <button 
                type="button" 
                onClick={addSpecification}
                className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-amber-100 transition-colors"
              >
                <FaPlus size={10} /> Add Spec
              </button>
            </div>
            
            <div className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-stone-50/50 border border-stone-200 rounded-2xl group">
                  <div className="flex-[2]">
                    <input 
                      type="text" placeholder="Varient (e.g. Color)" 
                      value={spec.key} onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-[14px] font-semibold"
                    />
                  </div>
                  <div className="flex-[2]">
                    <input 
                      type="text" placeholder="Value (e.g. Matte Black)" 
                      value={spec.value} onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-400 outline-none transition-all text-[14px] font-semibold"
                    />
                  </div>
                  <div className="flex-2 min-w-[80px]">
                    <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-xl px-2.5 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-all">
                      <span className="text-[14px] font-bold text-stone-400">₹</span>
                      <input 
                        type="number" placeholder="Price" 
                        value={spec.price} onChange={(e) => handleSpecChange(index, "price", e.target.value)}
                        className="w-full py-2.5 bg-transparent border-none outline-none text-[11px] font-semibold"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-[70px]">
                    <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-xl px-2.5 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-all">
                      <span className="text-[14px] font-bold text-stone-400 font-mono">#</span>
                      <input 
                        type="number" placeholder="Stock" 
                        value={spec.stock} onChange={(e) => handleSpecChange(index, "stock", e.target.value)}
                        className="w-full py-2.5 bg-transparent border-none outline-none text-[11px] font-semibold"
                      />
                    </div>
                  </div>
                  
                  {specifications.length > 1 && (
                    <button 
                      type="button" onClick={() => removeSpecification(index)}
                      className="w-9 h-9 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all flex-shrink-0"
                    >
                      <FaTrash size={10} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Media & Status */}
        <div className="space-y-8 lg:sticky lg:top-8 self-start">
          
          <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">Product Media</h3>
            
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-stone-300 rounded-2xl bg-stone-50 hover:bg-stone-100 hover:border-amber-500 transition-all cursor-pointer">
              <FaImage className="text-3xl text-stone-300 mb-2" />
              <span className="text-sm font-semibold text-stone-500">Click to upload images</span>
              <span className="text-xs text-stone-400 mt-1">PNG, JPG up to 5MB</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 pt-2">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 group">
                    <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    <button 
                      type="button" onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-white/90 text-red-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 shadow-sm transition-opacity"
                    >
                      <FaTimes size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">Product Status</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-600 block">Visibility</label>
                <select 
                  name="status" value={formData.status} onChange={handleInputChange}
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all appearance-none"
                >
                  <option value="Active">Active (Public)</option>
                  <option value="Inactive">Inactive (Hidden)</option>
                  <option value="Draft">Save as Draft</option>
                </select>
              </div>

              <label className="flex items-center gap-3 p-4 border border-stone-200 rounded-2xl cursor-pointer hover:bg-stone-50 transition-colors">
                <input 
                  type="checkbox" name="featured" 
                  checked={formData.featured} onChange={handleInputChange}
                  className="w-5 h-5 accent-amber-500 rounded"
                />
                <div>
                  <span className="text-sm font-bold text-stone-900 block">Featured Product</span>
                  <span className="text-xs text-stone-500">Show this product on the home banner</span>
                </div>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-5 rounded-[1.5rem] bg-stone-900 hover:bg-amber-500 text-white hover:text-stone-900 font-bold text-sm uppercase tracking-wide transition-colors shadow-xl shadow-stone-900/10 active:scale-95 border border-stone-800"
          >
            {initialData ? "Save Changes" : "Publish Product"}
          </button>
        </div>

      </form>
    </motion.div>
  );
}
