import React, { useState } from 'react';

function MainApp({ user, setUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => setUser(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;
    setLoading(true);
    setResponse(null);

    try {
      const result = await fetch(`http://127.0.0.1:5000/search/${searchTerm}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
      });

      if (!result.ok) throw new Error(`Fetch failed: ${result.status} ${result.statusText}`);
      setResponse(await result.json());
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
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Enter search term" disabled={loading} />
        <button type="submit" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
      </form>
      <div className="results">
        <h2>Results</h2>
        {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
        {!response && !loading && searchTerm && <p>No results yet. Try searching!</p>}
      </div>
    </div>
  );
}

export default MainApp;