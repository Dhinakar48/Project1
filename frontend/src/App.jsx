import { Routes, Route, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaBan } from "react-icons/fa"
import Navbar from "./Navbar"
import Footer from "./Footer"
import Home from "./Home"
import ProductDetails from "./ProductDetails"
import Cart from "./Cart"
import Wishlist from "./Wishlist"
import CategoryPage from "./CategoryPage"
import ShopAll from "./ShopAll"
import ScrollToTop from "./ScrollToTop"
import SellerLogin from "./SellerDashboard/SellerLogin"
import SellerDashboard from "./SellerDashboard/SellerDashboard"
import SellerRegister from "./SellerDashboard/SellerRegister"
import SellerOnboarding from "./SellerDashboard/SellerOnboarding"
import PortalSelection from "./PortalSelection"
import Login from "./Login"
import UserRegister from "./UserRegister"
import OrderPage from "./OrderPage"
import MyAccount from "./MyAccount"
import UserOnboarding from "./UserOnboarding"
import AdminDashboard from "./AdminDashboard/AdminDashboard"
import AdminLogin from "./AdminDashboard/AdminLogin"

function App () {
  const location = useLocation();
  const navigate = useNavigate();
  const [showBlockedAlert, setShowBlockedAlert] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('message') === 'blocked') {
      setShowBlockedAlert(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const authPaths = ["/seller-login", "/seller-register", "/seller-dashboard", "/seller-onboarding", "/portal-selection", "/login", "/signup", "/user-onboarding", "/admin", "/admin-login"];
  const isAuthPage = authPaths.some(path => location.pathname.startsWith(path));

  const hideFooterPaths = ["/order", "/admin", "/admin-login"];
  const isHideFooterPage = hideFooterPaths.some(path => location.pathname.startsWith(path));

  return (
    <div className="bg-white text-stone-900 min-h-screen">
      <ScrollToTop />

      {/* Blocked Account Modal */}
      <AnimatePresence>
        {showBlockedAlert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-md w-full text-center shadow-2xl border border-rose-100"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-inner">
                <FaBan size={40} />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mb-4 tracking-tight">Account Restricted</h2>
              <p className="text-stone-500 text-sm leading-relaxed mb-8">
                Your account has been suspended by the platform administrator for violating our terms of service or security policies.
              </p>
              <button 
                onClick={() => setShowBlockedAlert(false)}
                className="w-full bg-stone-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-600 transition-colors shadow-lg shadow-stone-900/10"
              >
                Acknowledge
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isAuthPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/shop-all" element={<ShopAll />} />
        <Route path="/seller-login" element={<SellerLogin />} />
        <Route path="/seller-dashboard" element={<SellerDashboard />} />
        <Route path="/seller-register" element={<SellerRegister />} />
        <Route path="/seller-onboarding" element={<SellerOnboarding />} />
        <Route path="/portal-selection" element={<PortalSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<UserRegister />} />
        <Route path="/user-onboarding" element={<UserOnboarding />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/my-account" element={<MyAccount />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin-login" element={<AdminLogin />} />
      </Routes>



      {(!isAuthPage && !isHideFooterPage) && <Footer />}
    </div>
  )
}

export default App