import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
   FaChartPie, FaBoxOpen, FaShoppingCart, FaShippingFast, 
   FaUndo, FaCreditCard, FaUsers, FaChartLine, FaUserCog, FaSignOutAlt 
} from "react-icons/fa";

// Component Imports
import Overview from "./components/Overview";
import Products from "./components/Products";
import Orders from "./components/Orders";
import Shipping from "./components/Shipping";
import Returns from "./components/Returns";
import Payments from "./components/Payments";
import Users from "./components/Users";
import Analytics from "./components/Analytics";
import Profile from "./components/Profile";

export default function AdminDashboard() {
   const [activeTab, setActiveTab] = useState("dashboard");
   const navigate = useNavigate();

   const navItems = [
      { id: "dashboard", label: "Dashboard", icon: FaChartPie, component: Overview },
      { id: "products", label: "Products", icon: FaBoxOpen, component: Products },
      { id: "orders", label: "Orders", icon: FaShoppingCart, component: Orders },
      { id: "shipping", label: "Shipping", icon: FaShippingFast, component: Shipping },
      { id: "returns", label: "Returns", icon: FaUndo, component: Returns },
      { id: "payments", label: "Payments", icon: FaCreditCard, component: Payments },
      { id: "users", label: "Users", icon: FaUsers, component: Users },
      { id: "analytics", label: "Analytics", icon: FaChartLine, component: Analytics },
      { id: "profile", label: "Profile", icon: FaUserCog, component: Profile },
   ];

   const handleLogout = () => {
      localStorage.removeItem('adminToken');
      navigate("/");
   };

   // Find the current component to render
   const ActiveComponent = navItems.find(item => item.id === activeTab)?.component || Overview;

   return (
      <div className="flex h-screen bg-stone-50 font-sans overflow-hidden text-stone-900">
         {/* Sidebar */}
         <aside className="w-64 bg-stone-900 text-white flex flex-col justify-between shrink-0 shadow-2xl relative z-20">
            <div>
               <div className="p-8 border-b border-stone-800">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                        <span className="font-bold text-lg leading-none tracking-tighter">A</span>
                     </div>
                     <span className="font-bold text-xl tracking-tight">Admin<span className="text-indigo-400">Core</span></span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mt-2">Superuser Console</p>
               </div>

               <nav className="p-4 space-y-1">
                  {navItems.map((item) => {
                     const Icon = item.icon;
                     const isActive = activeTab === item.id;
                     return (
                        <button
                           key={item.id}
                           onClick={() => setActiveTab(item.id)}
                           className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-semibold ${
                              isActive 
                                 ? 'bg-indigo-500/10 text-indigo-400 shadow-[inset_4px_0_0_#818cf8]' 
                                 : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                           }`}
                        >
                           <Icon className={isActive ? 'text-indigo-400' : 'text-stone-500'} />
                           {item.label}
                        </button>
                     );
                  })}
               </nav>
            </div>

            <div className="p-4">
               <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-800 text-stone-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-bold"
               >
                  <FaSignOutAlt /> Terminate Session
               </button>
            </div>
         </aside>

         {/* Main Content Area */}
         <main className="flex-1 overflow-y-auto bg-[#fafafa] no-scrollbar">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-200 px-8 py-5 flex justify-between items-center">
               <h2 className="text-2xl font-bold tracking-tight capitalize">{activeTab.replace('-', ' ')}</h2>
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-stone-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                     <span className="text-xs font-bold text-stone-500">ADM</span>
                  </div>
               </div>
            </header>

            <div className="p-8">
               <ActiveComponent />
            </div>
         </main>
      </div>
   );
}
