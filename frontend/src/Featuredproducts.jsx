import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { featuredProductsArray } from "./data";

export default function Featured() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            let combinedProducts = [];
            
            // 1. Get Static Products from data.js
            const staticMapped = featuredProductsArray.slice(0, 3).map(p => ({
                id: p.id,
                name: p.name,
                price: p.variants[0].price,
                img: p.variants[0].img,
                isStatic: true
            }));
            
            try {
                // 2. Get Dynamic Products from Backend
                const res = await axios.get("http://localhost:5000/featured-products");
                const dynamicMapped = res.data.map(p => ({
                    id: p.product_id,
                    name: p.name,
                    price: `₹${parseFloat(p.price).toLocaleString()}`,
                    img: (p.images && p.images.length > 0) ? p.images[0] : (p.main_image || "/placeholder-product.png"),
                    isStatic: false
                }));
                
                // Combine them - Backend products first
                combinedProducts = [...dynamicMapped, ...staticMapped];
            } catch (err) {
                console.error("Error fetching featured products:", err);
                combinedProducts = staticMapped; // Fallback to static only
            } finally {
                setProducts(combinedProducts);
                setIsLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    if (isLoading) return null;
    if (products.length === 0) return null;

    return (
        <div className="bg-stone-50 text-stone-900 py-24 px-6 md:px-16 lg:px-24">
            
            <div className="mb-16">
                <div className="space-y-4">
                    <motion.h1 
                        className="text-3xl md:text-5xl font-bold tracking-tight leading-none text-stone-900"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Featured <span className="text-amber-600">Products</span>
                    </motion.h1>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16 ">
                {products.slice(0, 6).map((item, i) => {
                    return (
                        <motion.div
                            key={item.id}
                            className="group relative flex flex-col"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            {/* Product Card Image Wrapper */}
                            <div className="relative aspect-[4/5] bg-amber-100/20 border border-amber-100 overflow-hidden mb-6 transition-all duration-700">
                                <img
                                    src={item.img}
                                    alt={item.name}
                                    className="w-full h-full object-contain p-12 group-hover:scale-110 transition duration-1000"
                                    onClick={() => navigate(`/product/${item.id}`, { state: { from: 'home' } })}
                                />
                                
                                <div className="absolute bottom-0 left-0 right-0 p-6 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                    <button className="w-full bg-amber-600 text-white py-3 text-[10px] font-black uppercase tracking-[0.2em]">
                                        Quick Purchase
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 px-2">
                                <div className="cursor-pointer" onClick={() => navigate(`/product/${item.id}`, { state: { from: 'home' } })}>
                                    <h2 className="text-xl font-bold tracking-tight text-stone-900 group-hover:text-amber-600 transition-colors">
                                        {item.name}
                                    </h2>
                                    <p className="text-sm font-black text-amber-600 mt-1">
                                        {item.price}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}