import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const SellerLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/seller/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('sellerToken', data.token);
        localStorage.setItem('sellerInfo', JSON.stringify(data.seller));
        navigate('/seller/dashboard');
      } else {
        alert(data.message || 'Login failed.');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='form'>
      <form onSubmit={handleSubmit}>

        <h2>Seller Login</h2>
        <p style={{ fontSize: '14px', color: '#6b6b6b', marginBottom: '12px' }}>
          Login to your VESTRA seller account.
        </p>

        <input
          type='email'
          id='email'
          placeholder='Email'
          onChange={handleChange}
          required
        />

        <input
          type='password'
          id='password'
          placeholder='Password'
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p style={{ fontSize: '13px', color: '#6b6b6b', marginTop: '12px', textAlign: 'center' }}>
          Don't have a seller account?{' '}
          <span
            onClick={() => navigate('/seller/register')}
            style={{ color: '#1D9E75', cursor: 'pointer', fontWeight: '600' }}
          >
            Register here
          </span>
        </p>

      </form>
    </div>
  );
};

export default SellerLogin;