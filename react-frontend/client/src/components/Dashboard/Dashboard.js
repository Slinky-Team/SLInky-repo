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
    setDarkMode((prevMode) => !prevMode);
  };

  // Sign out handler
  const handleSignOut = () => {
    navigate('/login'); // Redirect to login page
  };

  const handleHistory = () => {
    navigate('/History');
  };

  const handleSearch = async () => {
    if (!inputText.trim()) {
      alert('Please enter some text to search');
      return;
    }
  
    try {
      setResults([{ id: 'loading', status: 'Loading...', data: {} }]);
  
      // Step 1: Call the search-and-extract method
      const response = await fetch('/search-and-extract', {
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
      console.log('Raw data from /search-and-extract:', data);

      // Update the results with the oil processing output
      setResults(prevResults => [
        ...prevResults,
        {
          id: Date.now().toString(),
          query: inputText.trim(),
          timestamp: new Date().toISOString(),
          data: data || [], // Ensure `data` is an array
          status: 'Completed',
        },
      ]);
  
      // // Step 2: Extract keys from the response
      // const processedKeys = data.data?.map(item => item.threat?.indicator?.description); // Extract the "description" field as the key
      // console.log('Extracted keys:', processedKeys);
  
      // // Ensure the keys are unique
      // const uniqueKeys = [...new Set(processedKeys)];
  
      // if (uniqueKeys.length === 0) {
      //   console.error('No valid keys to send to oil.py');
      //   return;
      // }
  
      // // Step 3: Call the oil function for each key
      // for (const key of uniqueKeys) {
      //   console.log(`Sending request to /oil with key: ${encodeURIComponent(key)}`);
      //   const oilResponse = await fetch(`/oil?key=${encodeURIComponent(key)}`, {
      //     method: 'GET',
      //     headers: { 'Content-Type': 'application/json' },
      //     credentials: 'include',
      //   });
  
      //   if (!oilResponse.ok) {
      //     console.error(`Oil API returned ${oilResponse.status}: ${await oilResponse.text()}`);
      //   } else {
      //     const oilResult = await oilResponse.json();
      //     console.log(`Oil processing result for key ${key}:`, oilResult);
  
      //     // Update the results with the oil processing output
      //     setResults(prevResults => [
      //       ...prevResults,
      //       {
      //         id: Date.now().toString(),
      //         query: inputText.trim(),
      //         timestamp: new Date().toISOString(),
      //         data: oilResult.data || [], // Ensure `data` is an array
      //         status: 'Completed',
      //       },
      //     ]);
      //   }
      // }
    } catch (error) {
      console.error('Search error:', error);
      setResults([
        {
          id: 'error',
          status: 'Error',
          error: error.message || 'Failed to fetch results',
          data: [],
        },
      ]);
    }
  };

  const handleFangedDefangedChange = async (e) => {
    console.log(e.target.value);

    let processedInput = inputText.trim();
    var fang_value = e.target.value;

    if (fang_value === 'fanged' || fang_value === 'defanged') {
      try {
        const fangResponse = await fetch(`/fanging?mode=${fang_value}`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: processedInput,
        });
      
        if (!fangResponse.ok) {
          throw new Error(`Failed to fang/defang: ${await fangResponse.text()}`);
        }

        // Receive the raw fanged/defanged text
        const modifedText = await fangResponse.text();
        console.log("Modified Text:", modifedText);

        // Update inputText with the modified text from the response
        setInputText(modifedText);
        
      } catch (error) {
        console.error('Fanging/defanging failed:', error);
      }
    }

    setFangedDefanged(fang_value);
  };

  return (
    <div className={`dashboard-container ${darkMode ? 'dark-mode' : ''}`}>
      <header className="dashboard-header">
        <div className="logo">COX</div>
        <h1 className="title">Hyperion</h1>
        <div className="header-links">
          <button className="nav-link" onClick={handleHistory}>
            History
          </button>
          <button className="nav-link" onClick={handleSignOut}>
            Sign Out
          </button>
          <button className="nav-link" onClick={toggleDarkMode}>
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
            <button className="search-button" onClick={handleSearch}>
              Search
            </button>
          </div>
          <div className="search-box">
            <textarea
              className={fangedDefanged === 'fanged' ? 'glowing-border' : 'non-glowing-border'}
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