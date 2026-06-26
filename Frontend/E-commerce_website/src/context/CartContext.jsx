import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      setCartItems(response.data);
    } catch (error) {
      console.error('Failed to fetch cart', error);
    }
  };

  // Whenever login state changes, refresh or clear the cart automatically
  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [token]);

  const addToCart = async (product) => {
    try {
      await api.post('/cart/add', { product_id: product.id, quantity: 1 });
      fetchCart();
    } catch (error) {
      console.error('Failed to add to cart', error);
      alert('Failed to add to cart');
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      await api.put(`/cart/update/${cartItemId}`, { quantity });
      fetchCart();
    } catch (error) {
      console.error('Failed to update quantity', error);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await api.delete(`/cart/remove/${cartItemId}`);
      fetchCart();
    } catch (error) {
      console.error('Failed to remove item', error);
    }
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};