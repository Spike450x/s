import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase';

/**
 * Login component
 *
 * Allows existing users to log in with email and password.
 *
 * State:
 * - email: string for the user’s email input
 * - password: string for the user’s password input
 * - error: string for any login error messages
 *
 * On successful login, navigates to the '/dashboard' route.
 */
function Login() {
  const [email, setEmail] = useState('');          // Track email input
  const [password, setPassword] = useState('');    // Track password input
  const [error, setError] = useState('');          // Track error message
  const navigate = useNavigate();                  // Hook to redirect after login

  /**
   * handleLogin
   *
   * Called when the form is submitted. Attempts to sign in via Firebase Auth.
   * If successful, redirects to '/dashboard'. Otherwise, sets the error state.
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous error

    try {
      // Attempt Firebase sign-in with email and password
      await signInWithEmailAndPassword(auth, email, password);
      // On success, navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      // Display Firebase error message to the user
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center', padding: '2rem' }}>
      <h2>🔐 Log In</h2>
      <form onSubmit={handleLogin}>
        {/* Email Input Field */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(''); // Clear error when user types
          }}
          autoComplete="email"
          style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
          required
        />
        <br />

        {/* Password Input Field */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(''); // Clear error when user types
          }}
          autoComplete="current-password"
          style={{ padding: '10px', width: '100%', marginBottom: '15px' }}
          required
        />
        <br />

        {/* Submit Button */}
        <button
          type="submit"
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}
        >
          Log In
        </button>
      </form>

      {/* Display error message in red if login fails */}
      {error && (
        <p style={{ color: 'red', marginTop: '12px' }}>{error}</p>
      )}

      {/* Link to Signup page if user does not have an account */}
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
