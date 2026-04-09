import { motion } from "framer-motion";

export default function Footer() {
    return (
        <div className="bg-amber-50/30 text-stone-500 px-6 md:px-16 py-16 border-t border-amber-100/50">

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                >
                    <h2 className="text-amber-600 font-black uppercase tracking-widest text-[10px] mb-6 underline underline-offset-8">Shop</h2>
                    <ul className="space-y-2">
                        <li className="hover:text-amber-600 transition cursor-pointer font-bold lowercase">Audio</li>
                        <li className="hover:text-amber-600 transition cursor-pointer font-bold lowercase">Wearables</li>
                        <li className="hover:text-amber-600 transition cursor-pointer font-bold lowercase">Computing</li>
                        <li className="hover:text-amber-600 transition cursor-pointer font-bold lowercase">Accessories</li>
                    </ul>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-amber-600 font-black uppercase tracking-widest text-[10px] mb-6 underline underline-offset-8">Support</h2>
                    <ul className="space-y-2">
                        <li className="hover:text-amber-600 transition cursor-pointer font-bold lowercase">Contact</li>
                        <li className="hover:text-amber-600 transition cursor-pointer font-bold lowercase">FAQ</li>
                        <li className="hover:text-amber-600 transition cursor-pointer font-bold lowercase">Shipping</li>
                        <li className="hover:text-amber-600 transition cursor-pointer font-bold lowercase">Returns</li>
                    </ul>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-amber-600 font-black uppercase tracking-widest text-[10px] mb-6 underline underline-offset-8">Company</h2>
                    <ul className="space-y-2">
                        <li className="hover:text-amber-600 transition cursor-pointer font-bold lowercase">About</li>
                        <li className="hover:text-amber-600 transition cursor-pointer font-bold lowercase">Careers</li>
                        <li className="hover:text-amber-600 transition cursor-pointer font-bold lowercase">Press</li>
                        <li className="hover:text-amber-600 transition cursor-pointer font-bold lowercase">Sustainability</li>
                    </ul>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <h2 className="text-amber-600 font-black uppercase tracking-widest text-[10px] mb-6 underline underline-offset-8">Connect</h2>
                    <ul className="space-y-2">
                        <li className="hover:text-amber-600 transition cursor-pointer font-bold lowercase">Instagram</li>
                        <li className="hover:text-amber-600 transition cursor-pointer font-bold lowercase">Twitter</li>
                        <li className="hover:text-amber-600 transition cursor-pointer font-bold lowercase">YouTube</li>
                        <li className="hover:text-amber-600 transition cursor-pointer font-bold lowercase">Newsletter</li>
                    </ul>
                </motion.div>

            </div>

            <div className="mt-10 border-t border-stone-200 pt-6 text-sm text-center md:text-left">
                <p className="font-bold tracking-widest text-[8px] uppercase">© 2026 ElectroShop. Luxury Electronics Defined.</p>
            </div>

        </div>
    );
}