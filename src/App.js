import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import CharacterCreation from './components/CharacterCreation';
import Dashboard from './components/Dashboard';
import Shop from './components/Shop';
import Quests from './components/Quests';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { useEffect, useState } from 'react';
import Statistics from './components/Statistics';

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/signup" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/character-creation" element={<CharacterCreation />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/shop" element={user ? <Shop /> : <Navigate to="/login" />} />
        <Route path="/quests" element={user ? <Quests /> : <Navigate to="/login" />} />
        <Route path="/stats" element={<Statistics />} />
      </Routes>
    </Router>
  );
}

export default App;
