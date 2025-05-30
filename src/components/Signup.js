import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!email || !password) {
      return setError('Please enter email and password.');
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/character-creation');
    } catch (err) {
      console.error(err);
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h2>📝 Sign Up</h2>
      <input type="email" placeholder="Email" value={email}
        onChange={e => setEmail(e.target.value)} style={{ padding: '10px', width: '100%', marginBottom: '10px' }} />
      <input type="password" placeholder="Password" value={password}
        onChange={e => setPassword(e.target.value)} style={{ padding: '10px', width: '100%', marginBottom: '15px' }} />
      <button onClick={handleSignup} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>Create Account</button>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
}

export default Signup;
