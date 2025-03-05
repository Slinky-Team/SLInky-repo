import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';

// Import pages or components for routing
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;

    setLoading(true);
    setResponse(null);

    try {
      const url = `http://127.0.0.1:5000/search/${searchTerm}`;
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

  return (
    <Router>
      <div className="App">
        <h1>API Search</h1>

        <Routes>
          {/* Define routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>

        {/* The search form remains on every page */}
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
          {!response && !loading && searchTerm && (
            <p>No results yet. Try searching!</p>
          )}
        </div>
      </div>
    </Router>
  );
}

export default App;
