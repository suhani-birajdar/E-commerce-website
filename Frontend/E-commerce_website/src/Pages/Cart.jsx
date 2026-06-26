import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart } = useContext(CartContext);

  const total = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return <p className="cart-empty">Your cart is empty.</p>;
  }

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      {cartItems.map((item) => (
        <div className="cart-item" key={item.id}>
          <img src={item.image_url} alt={item.name} className="cart-item-image" />
          <div className="cart-item-info">
            <h4>{item.name}</h4>
            <p>₹{item.price}</p>
            <div className="quantity-controls">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
            </div>
          </div>
          <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
        </div>
      ))}
      <div className="cart-total">
        <h3>Total: ₹{total.toFixed(2)}</h3>
      </div>
    </div>
  );
};

export default Cart;