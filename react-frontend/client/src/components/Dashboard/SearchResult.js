import './SearchResult.css';
import React from 'react';

export const SearchResult = ({ result }) => {
  console.log('Result passed to SearchResult:', result);

  // Function to render nested objects and arrays
  const renderValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      return (
        <pre className="nested-object">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
    return value;
  };

  // Function to render the table
  const renderTable = (data) => {
    if (!Array.isArray(data)) return null;

    // Extract headers dynamically from all objects in the array, excluding "client"
    const headers = Array.from(
      new Set(data.flatMap((item) => Object.keys(item)))
    ).filter((header) => header !== 'client' && header !== 'testMsg'); // Exclude "client"

    return (
      <div className="table-container">
        <table className="result-table">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                {headers.map((header) => (
                  <td key={header}>
                    {renderValue(item[header])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="result-item">
      <div className="result-header">
        <div className="query-info">
          <span className="timestamp">
            {new Date(result.timestamp).toLocaleString()}
          </span>
        </div>
      </div>
      <div className="result-details">
        <h4>JSON Response</h4>
        {result.data ? (
          Array.isArray(result.data) ? (
            renderTable(result.data)
          ) : (
            <pre>{JSON.stringify(result.data, null, 2)}</pre>
          )
        ) : (
          <p>No data received</p>
        )}
      </div>
    </div>
  );
};