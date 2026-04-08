import { motion } from "framer-motion";

export default function Footer() {
    return (
        <div className="bg-stone-100 text-stone-600 px-6 md:px-16 py-12 border-t border-stone-200">

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                >
                    <h2 className="text-stone-900 font-semibold mb-4">Shop</h2>
                    <ul className="space-y-2">
                        <li className="hover:text-stone-900 cursor-pointer">Audio</li>
                        <li className="hover:text-stone-900 cursor-pointer">Wearables</li>
                        <li className="hover:text-stone-900 cursor-pointer">Computing</li>
                        <li className="hover:text-stone-900 cursor-pointer">Accessories</li>
                    </ul>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-stone-900 font-semibold mb-4">Support</h2>
                    <ul className="space-y-2">
                        <li className="hover:text-stone-900 cursor-pointer">Contact</li>
                        <li className="hover:text-stone-900 cursor-pointer">FAQ</li>
                        <li className="hover:text-stone-900 cursor-pointer">Shipping</li>
                        <li className="hover:text-stone-900 cursor-pointer">Returns</li>
                    </ul>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-stone-900 font-semibold mb-4">Company</h2>
                    <ul className="space-y-2">
                        <li className="hover:text-stone-900 cursor-pointer">About</li>
                        <li className="hover:text-stone-900 cursor-pointer">Careers</li>
                        <li className="hover:text-stone-900 cursor-pointer">Press</li>
                        <li className="hover:text-stone-900 cursor-pointer">Sustainability</li>
                    </ul>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <h2 className="text-stone-900 font-semibold mb-4">Connect</h2>
                    <ul className="space-y-2">
                        <li className="hover:text-stone-900 cursor-pointer">Instagram</li>
                        <li className="hover:text-stone-900 cursor-pointer">Twitter</li>
                        <li className="hover:text-stone-900 cursor-pointer">YouTube</li>
                        <li className="hover:text-stone-900 cursor-pointer">Newsletter</li>
                    </ul>
                </motion.div>

            </div>

            <div className="mt-10 border-t border-stone-200 pt-6 text-sm text-center md:text-left">
                <p>© 2026 APEX. All rights reserved.</p>
            </div>

        </div>
    );
}