import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { SearchResultsList } from './SearchResultsList';
import './Dashboard.css';
import { useEffect } from 'react'; 
const Dashboard = () => {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState([]);
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(location.state?.darkMode || false);
  const [fangedDefanged, setFangedDefanged] = useState('defanged');
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.body.style.background = "var(--bg-dark)";
      document.documentElement.style.background = "var(--bg-dark)";
    } else {
      document.body.style.background = "var(--bg-light)";
      document.documentElement.style.background = "var(--bg-light)";
    }
  }, [darkMode]);
  // Dark mode toggle function
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  // Sign out handler
  const handleSignOut = () => {
    navigate('/login'); // Redirect to login page
  };

  const handleHistory = () => {
    navigate('/History', { state: { darkMode } }); // Pass darkMode as state
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
      const searchResult = {
        id: Date.now().toString(),
        query: inputText.trim(),
        timestamp: new Date().toISOString(),
        data: data || [],
        status: 'Completed',
      };
  
      setResults((prevResults) => [...prevResults, searchResult]);  
  
      const saveResponse = await fetch('/api/search-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchResult.query,
          status: searchResult.status,
          data: searchResult.data,
        }),
        credentials: 'include',
      });
  
      if (!saveResponse.ok) {
        throw new Error(`Failed to save search history: ${await saveResponse.text()}`);
      }
  
      console.log('Search history saved successfully');

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

  // Helper to flatten nested objects into dot notation
  const flattenObject = (obj, depth = 0, rows = []) => {
    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;
  
      const value = obj[key];
      const row = new Array(depth).fill("").concat(["", key]);
  
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // If value is nested object, recurse deeper
        flattenObject(value, depth + 1, rows);
      } else if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === 'object') {
          for (const item of value) {
            flattenObject(item, depth + 1, rows);
          }
        } else {
          // If array of primitives, print each as its own row
          for (const item of value) {
            const itemRow = new Array(depth).fill("").concat([item, key]);
            rows.push(itemRow);
          }
        }
      } else {
        // Primitive value
        row[depth] = value;
        rows.push(row);
      }
    }
  
    return rows;
  };

  const handleCsvExport = (data) => {

    if (!data || Object.keys(data).length === 0) {
      alert('No results to export!');
      return;
    }

    console.log('Data passed in: ', data);

    const iocs = Object.keys(data[1].data);
    let iocData = {};


    for (let i=0; i<iocs.length; i++) {

      let currIocData = data[1].data[iocs[i]];

      if (!iocData[iocs[i]]) {
        iocData[iocs[i]] = [];
      }

      for (let j=0; j<Object.entries(currIocData).length; j++) {

        if (!currIocData[j].data?.data || Object.entries(currIocData[j].data.data) === 0) {
          break; // Skip is there is no data
        }

        let entry = currIocData[j].data.data; // Get all iocs enpoints entries


        // Obtain data source (oil, cbr, pdns.. etc.)
        let source = new URL(currIocData[j].source);
        source = source.pathname.slice(1);

        if (!iocData[iocs[i]][source]) {
          iocData[iocs[i]][source] = [];
        }

        iocData[iocs[i]][source].push(entry);

      }
    }
    // ===== CSV Export Begins Here =====
    let rows = [];

    for (const ioc in iocData) {
      rows.push(["", "", "", "-----------------------------"]);
      rows.push(["", "", "", `**** IOC: ${ioc} ****`]); // IOC header
      rows.push(["", "", "", "-----------------------------"]);

      for (const source in iocData[ioc]) {
        rows.push(["", "", "", "-----------------------------"]);
        rows.push(["", "", "", `>>>> Source: ${source} <<<<`]); // Source sub-header
        rows.push(["", "", "", "-----------------------------"]);
        rows.push([""]);

        for (const entry of iocData[ioc][source]) {
          const entryRows = flattenObject(entry);
          rows.push(...entryRows);
        }

        rows.push([""]); // blank row between sources
      }

      rows.push([""]); // blank row between IOCs
    }

    // Export to CSV
    const csvContent = rows.map(row =>
      row.map(col => `"${String(col ?? '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'exported_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

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
        <div className="logo">
          <img src="slinkyface.png" alt="Logo" className="dark-logo" />
          <img src="coxlogo.png" alt="Logo" className="light-logo" />
        </div>
        <h1 className="title">Security Lookup Interface</h1>
        <div className="header-links">
          <button className="nav-link" onClick={handleHistory}>
            History
          </button>
          <button className="nav-link" onClick={toggleDarkMode}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button className="nav-link" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="dashboard-layout">
        {/* Left Search Panel */}
        <div className="search-panel">
          <div className="search-header">
            <h3 className='search-header-text'>Search IP/Hostname</h3>
            <button className="search-button exempt" onClick={handleSearch}>
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
            <button onClick={() => handleCsvExport(results)} className="export-button">Export CSV</button>
          </div>
        </div>

        {/* Right Results Section */}
        <div className="results-section">
          {/* Combined Lookup Results */}
          <div className="lookup-container">
            <div className="lookup-header">
              <h3 className="lookup-title">Lookup Results</h3>
              <button onClick={() => handleCsvExport(results)} className="export-button">Export CSV</button>
            </div>
            <div className="results-box">
              <SearchResultsList results={results} darkMode={darkMode} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;