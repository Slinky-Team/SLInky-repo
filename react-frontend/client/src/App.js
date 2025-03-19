import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link,useNavigate } from 'react-router-dom';
import './App.css';

//Login Component
function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  //Handle form submisson
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Encode credentials for Basic Auth
    const credentials = btoa(`${username}:${password}`);

    try {
      //Send Login request to the backend
      const response = await fetch("/api/login", {
        method: "GET",
        headers: {
          Authorization: `Basic ${credentials}`,
        },
        credentials: "include", // Include cookies for session management
      });

      if (response.ok) {
        const data = await response.json();
        onLogin(data.message); // Update user state in the parent component
      } else {
        alert("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login.");
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        
        <input //UserName Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input //Password Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
}

function Register({ onRegister }) {
  const [username, setUsername] = useState(''); // State for username input
  const [password, setPassword] = useState(''); // State for password input
  const navigate = useNavigate(); // Initialize useNavigate

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Encode credentials for Basic Auth
    const credentials = btoa(`${username}:${password}`);

    try {
      // Send registration request to the backend
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`, // Include Basic Auth header
        },
        credentials: "include", // Include cookies for session management
      });

      if (response.ok) {
        const data = await response.json();
        onRegister(data.message); // Update user state in the parent component
        navigate('/login'); // Redirect to the login page after successful registration
      } else {
        alert("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("An error occurred during registration.");
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Register</h2>
        {/* Username input */}
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        {/* Password input */}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        {/* Submit button */}
        <button type="submit">Register</button>
        {/* Link to login page */}
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/register" element={<Register onRegister={setUser} />} />
        <Route path="/" element={user ? <MainApp user={user} setUser={setUser} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

function MainApp({ user, setUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    setUser(null); // Clear the user state
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;

    setLoading(true);
    setResponse(null);

    try {
      const url = `http://127.0.0.1:5000/search/${searchTerm}`;
      const result = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include"
      });

      if (!result.ok) throw new Error(`Fetch failed with status: ${result.status} ${result.statusText}`);
      const data = await result.json();
      setResponse(data);
    } catch (error) {
      console.error('Fetch error:', error.message);
      setResponse({ error: `Failed to fetch data: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>API Search</h1>
      <p>Welcome, {user}!</p>
      <button onClick={handleLogout}>Logout</button>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter search term"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
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
        {!response && !loading && searchTerm && <p>No results yet. Try searching!</p>}
      </div>
    </div>
  );
}

export default App;