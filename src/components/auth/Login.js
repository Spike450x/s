import React, { useRef, useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../firebase';

function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const email = emailRef.current?.value.trim();
    const password = passwordRef.current?.value;

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err.code);
      switch (err.code) {
        case 'auth/invalid-email':
          setError('The email address is badly formatted.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled. Please contact support.');
          break;
        case 'auth/user-not-found':
          setError('No account found with that email.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        default:
          setError('Login failed. Please try again.');
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center', padding: '2rem' }}>
      <h2>🔐 Log In</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          ref={emailRef}
          placeholder="Email"
          autoComplete="username"
          style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
          required
        />
        <br />
        <input
          type="password"
          ref={passwordRef}
          placeholder="Password"
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
        <div style={{ color: 'red', marginTop: '12px' }}>{error}</div>
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
