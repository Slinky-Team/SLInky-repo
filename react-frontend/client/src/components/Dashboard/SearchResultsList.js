import React from 'react';
import { SearchResult } from './SearchResult';

export const SearchResultsList = ({ results }) => {
  // Handle loading state
  if (results.length === 1 && results[0].status === 'Loading...') {
    return <div className="loading-container">Loading results...</div>;
  }
  
  // Handle error state
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
      {results.map((result) => (
        <SearchResult result={result} key={result.id} />
      ))}
    </div>
  );
};