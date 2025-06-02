// src/components/Signup.js

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    console.log('handleSignup called'); // <-- Should appear in Console

    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // On success, go to character creation:
      navigate('/character-creation');
    } catch (err) {
      console.error('Firebase auth error:', err);
      setError('Signup failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center', padding: '2rem' }}>
      <h2>📝 Sign Up</h2>
      <form onSubmit={handleSignup}>
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
          autoComplete="new-password"
          style={{ padding: '10px', width: '100%', marginBottom: '15px' }}
          required
        />
        <br />
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            marginTop: '10px'
          }}
        >
          {isSubmitting ? 'Creating Account…' : 'Create Account'}
        </button>
      </form>
      {error && (
        <p style={{ color: 'red', marginTop: '12px' }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default Signup;
