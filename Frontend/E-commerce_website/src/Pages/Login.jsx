import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    // First try admin login
    try {
      const adminRes = await api.post('/admin/login', { email, password });
      localStorage.setItem('adminToken', adminRes.data.token);
      navigate('/admin');
      return;
    } catch (adminErr) {
      // Not admin, continue to regular login
    }

    // Regular user login
    const response = await api.post('/auth/login', { email, password });
    login(response.data.user, response.data.token);
    alert(response.data.message);
    navigate('/');

  } catch (error) {
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    alert(message);
  }
};

  return (
    <div className='form'>
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <br />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <p>Don't have an account?<Link to="/register"> Register!</Link></p>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;