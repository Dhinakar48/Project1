import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { featuredProductsArray as products } from "./data";
import nothing from '../public/nothing.webp';
import watch from '../public/watch.jpg';

export function Categories() {
    const navigate = useNavigate();

    return (

        <div>
            <div className="bg-stone-50 text-stone-900 px-6 md:px-16 py-12">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    <Link to="/category/Audio">
                        <motion.div
                            className="relative h-[400px] overflow-hidden group cursor-pointer"
                            initial={{ opacity: 0, x: -70 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <img
                                src={nothing}
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                alt="Nothing"
                            />

                            <div className="absolute inset-0 bg-amber-900/30"></div>

                            <div className="absolute bottom-8 left-8">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 mb-2">Exclusive Series</h4>
                                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Audios</h2>
                                <p className="text-amber-100 text-xs mt-2 font-medium">Sonic Perfection</p>
                            </div>
                        </motion.div>
                    </Link>

                    {/* Wearables */}
                    <Link to="/category/Wearables">
                        <motion.div
                            className="relative h-[400px] overflow-hidden group cursor-pointer"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <img
                                src={watch}
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                alt="Watch"
                            />

                            <div className="absolute inset-0 bg-amber-900/30"></div>

                            <div className="absolute bottom-8 left-8">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 mb-2">Exclusive Series</h4>
                                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Wearables</h2>
                                <p className="text-amber-100 text-xs mt-2 font-medium">Future on Wrist</p>
                            </div>
                        </motion.div>
                    </Link>

                </div>
            </div>

            <div className="bg-stone-100 text-stone-900 text-center px-6 py-16 md:py-24">

                <motion.h1
                    className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    Experience Excellence
                </motion.h1>

                <motion.p
                    className="text-stone-600 text-sm sm:text-base md:text-lg mb-8"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Join thousands who demand more from their technology.
                </motion.p>

                <motion.button
                    onClick={() => navigate("/shop-all")}
                    className="bg-amber-600 text-white px-10 py-5 font-black text-[10px] uppercase tracking-[0.4em] hover:bg-amber-500 transition shadow-2xl shadow-amber-600/20"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    Explore Entire Collection
                </motion.button>

            </div>
        </div>
        
    );
}
