import { motion } from "framer-motion";
import { div } from "framer-motion/client";
import nothing from '../public/nothing.webp';
import watch from '../public/watch.jpg';

export function Categories() {
    return (

        <div>
            <div className="bg-stone-50 text-stone-900 px-6 md:px-16 py-12">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    <motion.div
                        className="relative h-[300px] md:h-[400px] overflow-hidden group"
                        initial={{ opacity: 0, x: -80 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <img
                            src= {nothing}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        />

                        <div className="absolute inset-0 bg-black/50"></div>

                        <div className="absolute bottom-6 left-6">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-100">Audio</h2>
                            <p className="text-gray-300 text-sm md:text-base">
                                Premium sound systems
                            </p>
                        </div>
                    </motion.div>

                    {/* Wearables */}
                    <motion.div
                        className="relative h-[300px] md:h-[400px] overflow-hidden group"
                        initial={{ opacity: 0, x: 80 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <img
                            src={watch}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        />

                        <div className="absolute inset-0 bg-black/50"></div>

                        <div className="absolute bottom-6 left-6">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-100">Wearables</h2>
                            <p className="text-gray-300 text-sm md:text-base">
                                Connected devices
                            </p>
                        </div>
                    </motion.div>

                </div>
            </div>

            <div className="bg-stone-100 text-stone-900 text-center px-6 py-16 md:py-24">

                <motion.h1
                    className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4"
                    initial={{ opacity: 0, y: -40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
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
                    className="bg-stone-900 text-stone-50 px-6 py-3 font-semibold hover:bg-stone-800 hover:scale-105 transition shadow-lg"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    Shop Now
                </motion.button>

            </div>
        </div>
        
    );
}
