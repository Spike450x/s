import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

/**
 * Signup component
 *
 * Allows new users to create an account using email and password.
 *
 * State:
 * - email: string for the email input
 * - password: string for the password input
 * - error: string for any signup error messages
 * - isSubmitting: boolean to disable form while signup request is in progress
 *
 * On successful signup, navigates to '/character-creation'.
 */
function Signup() {
  const [email, setEmail] = useState('');          // Track email input
  const [password, setPassword] = useState('');    // Track password input
  const [error, setError] = useState('');          // Track error message
  const [isSubmitting, setIsSubmitting] = useState(false); // Disable button during request
  const navigate = useNavigate();                  // Hook to redirect on success

  /**
   * handleSignup
   *
   * Called on form submission. Validates inputs, then calls Firebase Auth to create a new user.
   * If successful, navigates to '/character-creation'. Otherwise, displays error.
   */
  const handleSignup = async (e) => {
    e.preventDefault();
    console.log('handleSignup called'); // For debugging in console

    setError(''); // Clear previous error

    // Validate that both fields are filled
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Attempt to create a new user with Firebase Auth
      await createUserWithEmailAndPassword(auth, email, password);
      // On success, navigate to character creation screen
      navigate('/character-creation');
    } catch (err) {
      console.error('Firebase auth error:', err);
      // Display a combined error message
      setError('Signup failed: ' + err.message);
    } finally {
      setIsSubmitting(false); // Re-enable the form
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center', padding: '2rem' }}>
      <h2>📝 Sign Up</h2>
      <form onSubmit={handleSignup}>
        {/* Email Input Field */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(''); // Clear error on input change
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
            setError(''); // Clear error on input change
          }}
          autoComplete="new-password"
          style={{ padding: '10px', width: '100%', marginBottom: '15px' }}
          required
        />
        <br />

        {/* Submit Button, disabled while submitting */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            marginTop: '10px',
          }}
        >
          {isSubmitting ? 'Creating Account…' : 'Create Account'}
        </button>
      </form>

      {/* Display error message if signup fails */}
      {error && (
        <p style={{ color: 'red', marginTop: '12px' }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default Signup;
