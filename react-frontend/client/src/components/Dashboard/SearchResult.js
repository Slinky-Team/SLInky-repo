import React from 'react';

export const SearchResult = ({ result }) => {
  console.log('Result passed to SearchResult:', result);
  return (
    <div className="result-item">
      <div className="result-header">
        <div className="query-info">
          <strong>Query: {result.query} </strong>
          <span className="timestamp">{new Date(result.timestamp).toLocaleString()}</span>
        </div>
      </div>
      <div className="result-details">
        <h4>JSON Response</h4>
        {result.data ? (
          <pre>{JSON.stringify(result.data, null, 2)}</pre>
        ) : (
          <p>No data received</p>
        )}
      </div>
    </div>
  );
};