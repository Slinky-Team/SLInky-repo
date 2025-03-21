import React, { useState } from 'react';
import { SearchResultsList } from './SearchResultsList';
import './Dashboard.css';

const Dashboard = () => {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!inputText.trim()) {
      alert("Please enter an IP or hostname to search");
      return;
    }
    
    try {
      // Clean input - remove any extra spaces, newlines, etc.
      const searchTerms = inputText.trim().split(/[\s,\n]+/).filter(term => term);
      
      // Start with empty results array
      const searchResults = [];
      
      // Show loading state
      setResults([{ id: 'loading', status: 'Loading...', data: {} }]);
      
      // Process each search term
      for (const term of searchTerms) {
        const response = await fetch(`/search/${encodeURIComponent(term)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${await response.text()}`);
        }
        
        const data = await response.json();
        
        // Add to results with a unique ID
        searchResults.push({
          id: Date.now() + Math.random().toString(36).substring(2, 9),
          query: term,
          timestamp: new Date().toISOString(),
          data: data,
          status: 'Completed'
        });
      }
      
      // Update results state with all search results
      setResults(searchResults);
      
    } catch (error) {
      console.error('Search error:', error);
      setResults([{
        id: 'error',
        status: 'Error',
        error: error.message || 'Failed to fetch results',
        data: {}
      }]);
    }
  };

  const handleExport = () => {
    console.log('Exporting CSV');
  };

  return (
    <div>
      {/* Header */}
      <header>
        <h1>Hyperion v0.1</h1>
        <div>
          <a href="/history">History</a>
          <a href="/logout">Sign Out</a>
        </div>
      </header>

      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3">
          <div>
            <h5>Search IP/Hostname</h5>
            <textarea
              rows="10"
              placeholder="Search"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
            <div>
              <span>○ Defanged</span>
              <span>○ Fanged</span>
            </div>
            <button onClick={handleExport}>Export CSV</button>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9">
          <div>
            <h5>Lookup Results</h5>
            <SearchResultsList results={results} />
            <button onClick={handleExport}>Export CSV</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;