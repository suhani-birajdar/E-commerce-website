import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const SellerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    shop_name: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/seller/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (response.ok) {
        alert('Registration successful! Please wait for admin approval. You will receive an email once approved.');
        navigate('/login');
      } else {
        alert(data.message || 'Something went wrong.');
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

        <h2>Become a Seller</h2>
        <p style={{ fontSize: '14px', color: '#6b6b6b', marginBottom: '12px' }}>
          Create your seller account and start listing on VESTRA.
        </p>

        <input
          type='text'
          id='name'
          placeholder='Full Name'
          onChange={handleChange}
          required
        />

        <input
          type='text'
          id='shop_name'
          placeholder='Shop Name'
          onChange={handleChange}
          required
        />

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
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>

        <p style={{ fontSize: '13px', color: '#6b6b6b', marginTop: '12px', textAlign: 'center' }}>
          Already a seller?{' '}
          <span
            onClick={() => navigate('/seller/login')}
            style={{ color: '#1D9E75', cursor: 'pointer', fontWeight: '600' }}
          >
            Login here
          </span>
        </p>

      </form>
    </div>
  );
};

export default SellerRegister;