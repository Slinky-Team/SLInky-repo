import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Home from './components/home';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Fetch the current user on initial load (to check if already logged in)
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/dashboard', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentUser({ username: data.username });
        }
      } catch (error) {
        console.error('Failed to fetch current user', error);
      }
    };

    fetchCurrentUser();
  }, []); // Empty dependency array means this runs once when the component mounts

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home currentUser={currentUser} setCurrentUser={setCurrentUser} />} />
        <Route path="/login" element={<Login onLogin={setCurrentUser} />} />
        <Route path="/register" element={<Register onRegister={setCurrentUser} />} />
        <Route path="/dashboard" element={currentUser ? <Dashboard user={currentUser} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
