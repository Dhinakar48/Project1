import { Routes, Route, useLocation } from "react-router-dom"
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
  const authPaths = ["/seller-login", "/seller-register", "/seller-dashboard", "/seller-onboarding", "/portal-selection", "/login", "/signup", "/user-onboarding", "/admin", "/admin-login"];
  const isAuthPage = authPaths.includes(location.pathname);

  const hideFooterPaths = ["/order", "/admin", "/admin-login"];
  const isHideFooterPage = hideFooterPaths.includes(location.pathname);

  return (
    <div className="bg-white text-stone-900 min-h-screen">
      <ScrollToTop />
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