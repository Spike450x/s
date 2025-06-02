// src/App.js

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth-related screens (still in src/components/)
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';

// Character creation (still in src/components/)
import CharacterCreation from './components/charactercreation/CharacterCreation';

// Dashboard (moved into dashboard/ subfolder)
import Dashboard from './components/dashboard/Dashboard';

// Other feature screens (still in src/components/)
import Quests from './components/quests/Quests';
import Shop from './components/shop/Shop';
import Statistics from './components/statistics/Statistics';

function App() {
  return (
    <Routes>
      {/* Redirect root to /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth flows */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Character creation */}
      <Route path="/character-creation" element={<CharacterCreation />} />

      {/* Main app */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/quests" element={<Quests />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/stats" element={<Statistics />} />

      {/* Catch-all → redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
