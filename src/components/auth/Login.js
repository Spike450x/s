// src/components/auth/Login.js

import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../firebase'; // note the updated relative path

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center', padding: '2rem' }}>
      <h2>🔐 Log In</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          autoComplete="email"
          style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          autoComplete="current-password"
          style={{ padding: '10px', width: '100%', marginBottom: '15px' }}
          required
        />
        <br />
        <button
          type="submit"
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}
        >
          Log In
        </button>
      </form>
      {error && (
        <p style={{ color: 'red', marginTop: '12px' }}>{error}</p>
      )}
      <p style={{ marginTop: '15px' }}>
        Don’t have an account?{' '}
        <Link to="/signup" style={{ color: '#3498db', textDecoration: 'none' }}>
          Sign Up
        </Link>
      </p>
    </div>
  );
}

export default Login;
