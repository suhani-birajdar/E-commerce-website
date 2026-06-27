import React, { useContext } from 'react'
import './Header.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Header = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const { cartCount } = useContext(CartContext);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

  return (
    <header className='header'>
        <div className='logo'>
            <h2>VESTRA</h2>
        </div>

        <nav className='navigators'>
            <button className='products' onClick={() => navigate('/products')}>Products</button>
            <span onClick={() => navigate('/seller/register')}>Become a Seller</span>
            <span onClick={() => navigate('/about')}>About Us</span>
            <button className='cart' onClick={() => navigate('/cart')}>
                🛒 Cart {cartCount > 0 && `(${cartCount})`}
            </button>

            {user ? (
                <>
                    <span>Hi, {user.username}</span>
                    <button onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <button className='login' onClick={() => navigate('/login')}>Login</button>
            )}
        </nav>
    </header>
  )
}

export default Header