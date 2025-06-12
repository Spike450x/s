import React, { useRef, useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';

function Signup() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    const email = emailRef.current?.value.trim();
    const password = passwordRef.current?.value;

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/character-creation');
    } catch (err) {
      console.error('Firebase auth error:', err.code);
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('This email is already in use.');
          break;
        case 'auth/invalid-email':
          setError('The email address is badly formatted.');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters.');
          break;
        default:
          setError('Signup failed. Please try again.');
      }
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
          ref={emailRef}
          placeholder="Email"
          autoComplete="email"
          style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
          required
        />
        <br />
        <input
          type="password"
          ref={passwordRef}
          placeholder="Password"
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
            marginTop: '10px',
          }}
        >
          {isSubmitting ? 'Creating Account…' : 'Create Account'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', marginTop: '12px' }}>{error}</div>
      )}
    </div>
  );
}

export default Signup;
