// src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';

import Signup from './components/Signup';
import Login from './components/Login';
import CharacterCreation from './components/CharacterCreation';
import Dashboard from './components/Dashboard';
import Shop from './components/Shop';
import Quests from './components/Quests';
import Statistics from './components/Statistics';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* If someone hits "/" exactly, send them to "/login" */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Sign-Up and Login */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Character Creation (only after signup) */}
          <Route path="/character-creation" element={<CharacterCreation />} />

          {/* Main App (only after login) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/stats" element={<Statistics />} />

          {/* Anything else → redirect to "/login" */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
