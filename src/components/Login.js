import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Logged in:", user.email);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Log In</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <br /><br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <br /><br />
      <button type="submit">Log In</button>
      <br /><br />
      <p>
        Don’t have an account? <Link to="/">Sign Up</Link>
      </p>
    </form>
  );
}

export default Login;
