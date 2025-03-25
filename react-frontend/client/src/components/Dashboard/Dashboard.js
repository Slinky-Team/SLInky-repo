import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchResultsList } from './SearchResultsList';
import './Dashboard.css';

const Dashboard = () => {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [fangedDefanged, setFangedDefanged] = useState('defanged');
  const navigate = useNavigate();

  // Dark mode toggle function
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  // Sign out handler
  const handleSignOut = () => {
    // Add any logout logic here (e.g., API call)
    navigate('/login'); // Redirect to login page
  };

  const handleSearch = async () => {
    if (!inputText.trim()) {
      alert('Please enter some text to search');
      return;
    }

    try {
      setResults([{ id: 'loading', status: 'Loading...', data: {} }]);

      // Send the raw text to the backend for extraction
      const response = await fetch('http://localhost:7000/search-and-extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: inputText,
        credentials: 'include', 
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      // Format the result into a single entry (since IOC endpoint handles everything)
      const searchResult = {
        id: Date.now().toString(),
        query: inputText.trim(), // Use the full input as the query
        timestamp: new Date().toISOString(),
        data: data.data, // The JSON from the IOC extraction API
        status: 'Completed',
      };

      setResults([searchResult]);

    } catch (error) {
      console.error('Search error:', error);
      setResults([{
        id: 'error',
        status: 'Error',
        error: error.message || 'Failed to fetch results',
        data: {},
      }]);
    }
  };

  const handleFangedDefangedChange = (e) => {
   
    
  }

  return (
    <div className={`dashboard-container ${darkMode ? 'dark-mode' : ''}`}>
      <header className="dashboard-header">
        <div className="logo">COX</div>
        <h1 className="title">Hyperion</h1>
        <div className="header-links">
          <a href="/history" className="nav-link">History</a>
          <button 
            className="nav-link" 
            onClick={handleSignOut}
          >
            Sign Out
          </button>
          <button 
            className="nav-link" 
            onClick={toggleDarkMode}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="dashboard-layout">
        {/* Left Search Panel */}
        <div className="search-panel">
          <div className="search-header">
            <h3>Search IP/Hostname</h3>
            <button className="search-button" onClick={handleSearch}>Search</button>
          </div>
          <div className="search-box">
            <textarea
              placeholder="Enter IP or Hostname..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
          <div className="search-options">
            <div className="radio-buttons">
              <label>
                <input
                  type="radio"
                  value="defanged"
                  checked={fangedDefanged === 'defanged'}
                  onChange={handleFangedDefangedChange}
                />
                Defanged
              </label>
              <label>
                <input
                  type="radio"
                  value="fanged"
                  checked={fangedDefanged === 'fanged'}
                  onChange={handleFangedDefangedChange}
                />
                Fanged
              </label>
            </div>
            <button className="export-button">Export CSV</button>
          </div>
        </div>

        {/* Right Results Section */}
        <div className="results-section">
          {/* Combined Lookup Results */}
          <div className="lookup-container">
            <div className="lookup-header">
              <h3 className="lookup-title">Lookup Results</h3>
              <button className="export-button">Export CSV</button>
            </div>
            <div className="results-box">
              <SearchResultsList results={results} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;