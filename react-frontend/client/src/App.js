import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login'; // Assuming Login and Register components are in the same folder
import Register from './Register';
import Dashboard from './Dashboard';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      const url = `http://127.0.0.1:7000/search/${searchTerm}`;
      console.log('Attempting to fetch from:', url);

      const result = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!result.ok) {
        throw new Error(`Fetch failed with status: ${result.status} ${result.statusText}`);
      }

      const data = await result.json();
      console.log('Received data:', data);
      setResponse(data);

    } catch (error) {
      console.error('Fetch error:', error.message);
      setResponse({ error: `Failed to fetch data: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

 // Handle login POST request
 const handleLogin = async (credentials) => {
  try {
    const url = 'http://127.0.0.1:7000/login';
    const result = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!result.ok) {
      throw new Error(`Login failed: ${result.status} ${result.statusText}`);
    }

    const data = await result.json();
    console.log('Login successful:', data);
    setCurrentUser({ username: data.username });

  } catch (error) {
    console.error('Login error:', error.message);
  }
};

// Handle register POST request
const handleRegister = async (userData) => {
  try {
    const url = 'http://127.0.0.1:7000/register';
    const result = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!result.ok) {
      throw new Error(`Registration failed: ${result.status} ${result.statusText}`);
    }

    const data = await result.json();
    console.log('Registration successful:', data);
    
    // Redirect to login after successful registration
    setCurrentUser(null);
  } catch (error) {
    console.error('Registration error:', error.message);
  }
};

return (
  <Router>
    <div className="App">
      <Routes>
        <Route path="/" element={<Home currentUser={currentUser} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onRegister={handleRegister} />} />
        <Route 
          path="/dashboard" 
          element={currentUser ? <Dashboard /> : <Navigate to="/login" />} 
        />
      </Routes>
     

        <div className="results">
          <h2>Results</h2>
          {response && (
            <>
              <div>
                <h3>Azure Data</h3>
                <pre>{JSON.stringify(response.azure || response.error, null, 2)}</pre>
              </div>

              {!response.error && (
                <div>
                  <h3>Okta Data</h3>
                  <pre>{JSON.stringify(response.okta, null, 2)}</pre>
                </div>
              )}
            </>
          )}
          {!response && !loading && searchTerm && (
            <p>No results yet. Try searching!</p>
          )}
        </div>
      </div>
    </Router>
  );
}

export default App;
