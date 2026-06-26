import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      alert(data.message);

      if (response.ok) {
        navigate('/verify-otp', { state: { email: formData.email } });
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

        <h2>Register</h2>

        <input type='text' id='name' placeholder='Username' onChange={handleChange} />

        <input type='password' id='password' placeholder='Password' onChange={handleChange} />

        <input type='email' id='email' placeholder='Email' onChange={handleChange} />

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>

      </form>
    </div>
  )
}

export default Register