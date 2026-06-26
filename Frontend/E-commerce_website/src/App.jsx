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
              <Route path="/" element={<div>Home page coming soon</div>} />
              <Route path="/products" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
            </Route>
            <Route path='/register' element={<Register/>} />
            <Route path="/login" element={<Login />} />
            <Route path='/verify-otp' element={<VerifyOtp />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App