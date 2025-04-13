import React from 'react';
import { SearchResult } from './SearchResult';

export const SearchResultsList = ({ results, darkMode }) => {
  // console.log('Results passed to SearchResultsList:', results);
  if (results.length === 1 && results[0].status === 'Loading...') {
    return <div className="loading-container">Loading results...</div>;
  }
  
  if (results.length === 1 && results[0].status === 'Error') {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{results[0].error}</p>
      </div>
    );
  }

  return (
    <div className="results-container">
      <h3>Search Results</h3>
      {results.length > 0 ? (
        results.map((result) => (
          <SearchResult result={result} darkMode={darkMode} key={result.id} />
        ))
      ) : (
        <p>No results to display</p>
      )}
    </div>
  );
};