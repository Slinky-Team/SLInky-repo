import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);  // State to store search history

  // Fetch search history when the component is mounted
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const result = await fetch('http://127.0.0.1:5000/history');
        const data = await result.json();
        setHistory(data.history);  // Update the search history state
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    fetchHistory();
  }, []); // This useEffect runs only once on component mount

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) return; // Do nothing if the search term is empty

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

      // After fetching the data, submit the search term to update the history
      await fetch('http://127.0.0.1:5000/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          search: searchTerm,
        }),
      });

      // Update search history after a successful search
      const historyResult = await fetch('http://127.0.0.1:5000/history');
      const historyData = await historyResult.json();
      setHistory(historyData.history);

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

      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter IP/Domain name"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="history">
        <h2>Search History</h2>
        <ul>
          {history.length > 0 ? (
            history.map((item, index) => (
              <li key={index}>{item}</li>
            ))
          ) : (
            <p>No search history available.</p>
          )}
        </ul>
      </div>

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
  );
}

export default App;
