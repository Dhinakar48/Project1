import { Routes, Route } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import Home from "./Home"
import ProductDetails from "./ProductDetails"
import Cart from "./Cart"
import Wishlist from "./Wishlist"

function App () {

  return (
    <div className="overflow-x-hidden bg-stone-50 text-stone-900 min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App