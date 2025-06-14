// src/App.js

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth screens
import Login  from './components/auth/Login';
import Signup from './components/auth/Signup';

// Character creation
import CharacterCreation from './components/charactercreation/CharacterCreation';

// Main screens
import Dashboard      from './components/dashboard/Dashboard';
import Quests         from './components/quests/Quests';
import Shop           from './components/shop/Shop';
import Statistics     from './components/statistics/Statistics';
import FitnessHistory from './components/dashboard/FitnessHistory';

function App() {
  return (
    <Routes>
      {/* Redirect root to /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Character creation */}
      <Route path="/character-creation" element={<CharacterCreation />} />

      {/* Main app */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/quests"     element={<Quests />} />
      <Route path="/shop"       element={<Shop />} />
      <Route path="/stats"      element={<Statistics />} />
      <Route path="/fitness-history" element={<FitnessHistory />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
