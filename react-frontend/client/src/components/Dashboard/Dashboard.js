import React, { useState } from 'react';
import { SearchResultsList } from './SearchResultsList';
import './Dashboard.css';

const Dashboard = () => {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState([]);

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

  const handleExport = () => {
    console.log('Exporting CSV');
   
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Hyperion v0.1</h1>
        <nav>
          <a href="/history">History</a>
          <a href="/logout">Sign Out</a>
        </nav>
      </header>

      <div className="row">
        {/* Sidebar */}
        <aside className="col-md-3 sidebar">
          <h5>Search IP/Hostname</h5>
          <textarea
            rows="10"
            placeholder="Enter IPs, hostnames, or any text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="search-input"
          />
          <button onClick={handleSearch} className="btn-search">Search</button>
          <div className="search-options">
            <span>○ Defanged</span>
            <span>○ Fanged</span>
          </div>
          <button onClick={handleExport} className="btn-export">Export CSV</button>
        </aside>

        {/* Main Content */}
        <main className="col-md-9 main-content">
          <h5>Lookup Results</h5>
          <SearchResultsList results={results} />
          <button onClick={handleExport} className="btn-export">Export CSV</button>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;