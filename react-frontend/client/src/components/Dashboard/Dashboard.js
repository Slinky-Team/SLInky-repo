import React, { useState } from 'react';
import { SearchResultsList } from './SearchResultsList';
import './Dashboard.css';

const Dashboard = () => {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [fangedDefanged, setFangedDefanged] = useState('defanged'); // State for radio buttons

  const handleSearch = async () => {
    if (!inputText.trim()) {
      alert("Please enter an IP or hostname to search");
      return;
    }
    
    try {
      const searchTerms = inputText.trim().split(/[\s,\n]+/).filter(term => term);
      const searchResults = [];
      setResults([{ id: 'loading', status: 'Loading...', data: {} }]);
      
      for (const term of searchTerms) {
        const response = await fetch(`/search/${encodeURIComponent(term)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${await response.text()}`);
        }
        
        const data = await response.json();
        searchResults.push({
          id: Date.now() + Math.random().toString(36).substring(2, 9),
          query: term,
          timestamp: new Date().toISOString(),
          data: data,
          status: 'Completed'
        });
      }
      
      setResults(searchResults);
      
    } catch (error) {
      console.error('Search error:', error);
      setResults([{ id: 'error', status: 'Error', error: error.message || 'Failed to fetch results', data: {} }]);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const handleFangedDefangedChange = (e) => {
    setFangedDefanged(e.target.value);
  };

  return (
    <div className={`dashboard-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo">COX</div>
        <h1 className="title">Hyperion</h1>
        <div className="header-links">
          <a href="/history">History</a>
          <a href="/logout">Sign Out</a>
          <button className="dark-mode-toggle" onClick={toggleDarkMode}>
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
          {/* Internal Lookup Results */}
          <div className="lookup-container">
            <div className="lookup-header">
              <h3 className="lookup-title">Internal Lookup Results</h3>
              <button className="export-button">Export CSV</button>
            </div>
            <div className="results-box">
              <SearchResultsList results={results} />
            </div>
          </div>

          {/* External Lookup Results */}
          <div className="lookup-container">
            <div className="lookup-header">
              <h3 className="lookup-title">External Lookup Results</h3>
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