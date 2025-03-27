import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clearingHistory, setClearingHistory] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/search-history', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear your search history?')) {
      try {
        setClearingHistory(true);
        const response = await fetch('/api/search-history/clear', {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to clear history');
        }
        
        setHistory([]);
        alert('Search history cleared successfully');
      } catch (err) {
        setError(`Failed to clear history: ${err.message}`);
      } finally {
        setClearingHistory(false);
      }
    }
  };

  return (
    <div className="history-container">
      <header className="history-header">
        <h1>Search History</h1>
        <div className="header-buttons">
          <button className="back-button" onClick={handleBack}>
            Back to Dashboard
          </button>
          {history.length > 0 && (
            <button 
              className="clear-button" 
              onClick={handleClearHistory}
              disabled={clearingHistory}
            >
              {clearingHistory ? 'Clearing...' : 'Clear History'}
            </button>
          )}
        </div>
      </header>
      
      <div className="history-content">
        <h2>Your Recent Searches</h2>
        
        {loading && <p>Loading history...</p>}
        {error && <p className="error">Error: {error}</p>}
        
        {!loading && !error && history.length === 0 && (
          <p>No search history available yet.</p>
        )}
        
        {!loading && !error && history.length > 0 && (
          <table className="history-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Query</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id || Math.random()}>
                  <td>{item.username || 'Current User'}</td>
                  <td>{item.query}</td>
                  <td>{new Date(item.timestamp).toLocaleString()}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default History;