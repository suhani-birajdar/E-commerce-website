import { Routes, Route, BrowserRouter, Outlet } from 'react-router-dom'
import './App.css'
import Header from './Components/Header'
import Login from './Pages/Login'
import Register from './Pages/Register'
import VerifyOtp from './Pages/verifyOtp'
import Products from './Pages/Products'
import Cart from './Pages/Cart'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Home from './Pages/Home'
import AdminPanel from './Pages/AdminPanel'
import SellerRegister from './Pages/SellerRegister'
import SellerLogin from './Pages/SellerLogin'
import SellerDashboard from './Pages/SellerDashboard'
import AboutUs from './Components/AboutUs'

const Layout = () => (
  <>
    <Header />
    <Outlet />
  </>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={< Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/about" element={<AboutUs />} />
            </Route>
            <Route path='/register' element={<Register/>} />
            <Route path="/login" element={<Login />} />
            <Route path='/verify-otp' element={<VerifyOtp />} />

            <Route path='/admin' element={<AdminPanel />} />

            <Route path='/seller/register' element={<SellerRegister />} />
            <Route path='/seller/login' element={<SellerLogin />} />
            <Route path='/seller/dashboard' element={<SellerDashboard />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App