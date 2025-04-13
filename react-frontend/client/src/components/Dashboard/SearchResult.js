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
    console.log('Rendering table with current DATA!!!!: ', data);
    if (!Array.isArray(data) || data.length === 0) return null;

    let formattedResults = {};
    let keys = [];

    // Loop through each ioc
    for (let i=0; i<data.length; i++) {
      const curr_key = data[i][0]; // Get current key
      let sources = {source: []};

      if (!keys.includes(String(curr_key))) {
        keys.push(curr_key);
      }

      // Loop through each result in the current ioc
      for (let j=0; j<data[i][1].length; j++) {
        sources.source.push(data[i][1][j].source);
      }

      for (let j=0; j<sources.source.length; j++) {
        let endpoint = String(sources.source[j]);

        if (!formattedResults[curr_key]) {
          formattedResults[curr_key] = {};
        }
        
        if (endpoint.includes('oil/email')) {
          formattedResults[curr_key]['oil_email'] = data[i][1][j].data?.data?.[0] ?? 'No info found';
        } else if (endpoint.includes('oil')) {
          formattedResults[curr_key]['oil'] = data[i][1][j].data?.data ?? 'No info found';
        }
        
        if (endpoint.includes('pdns')) {
          formattedResults[curr_key]['pdns'] = data[i][1][j].data?.data?.[0]?.dns?.answers ?? 'No info found';
        }
        
        if (endpoint.includes('cbr')) {
          formattedResults[curr_key]['cbr'] = data[i][1][j].data?.data?.[0] ?? 'No info found';
        }
        
        if (endpoint.includes('vpn')) {
          formattedResults[curr_key]['vpn'] = data[i][1][j].data?.data?.[0] ?? 'No info found';
        }
        
        if (endpoint.includes('asset')) {
          // Route for obtaining asset data is probably wrong: Fix later!!!
          formattedResults[curr_key]['asset'] = data[i][1][j].data?.data?.[0] ?? 'No info found';
        }
      }
    }

    console.log('Results: ', formattedResults);

    // Get all unique keys
    const allSources = ['oil_email', 'oil', 'pdns', 'cbr', 'vpn', 'asset'];

    return <OilTable data={formattedResults} keys={keys} />;
  };

  const OilTable = ({ data, keys }) => {
    const getAllHeaders = (data) => {
      const headers = new Set();
      keys.forEach((ioc) => {
        const entries = data[ioc]?.oil;
        if (Array.isArray(entries)) {
          entries.forEach((entry) => {
            Object.keys(entry || {}).forEach((key) => headers.add(key));
          });
        }
      });
      return Array.from(headers);
    };
  
    const flattenValue = (value, indent = 0) => {
      const indentation = '\u00A0'.repeat(indent); // non-breaking space for indent

        if (typeof value === 'object' && value !== null) {
          return Object.entries(value).map(([key, val], idx) => {
            if (typeof val === 'object' && val !== null) {
              return (
                <React.Fragment key={idx}>
                  <div>
                    {indentation}<strong>{key}:</strong>
                  </div>
                  {flattenValue(val, indent + 4)}
                </React.Fragment>
              );
            } else {
              return (
                <div key={idx}>
                  {indentation}<strong>{key}:</strong> {String(val)}
                </div>
              );
            }
          });
        }

        return <div>{indentation}{String(value)}</div>;
    };
  
    const headers = getAllHeaders(data);
  
    return (
      <div className="table-container">
        {keys.map((ioc) => {
          const entries = data[ioc]?.oil;
          if (!entries || entries.length === 0) return null;
  
          return (
            <div key={ioc}>
              <table className="result-table">
                <thead>
                  <tr>
                    <th>IOC</th>
                    {headers.map((header) => (
                      <th key={header}>{header.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(entries) ? (
                    entries.map((entry, idx) => (
                      <tr key={idx}>
                        <td>{ioc}</td>
                        {headers.map((header) => (
                          <td key={header}>
                            <pre className="nested-object">
                              {flattenValue(entry?.[header] ?? 'n/a')}
                            </pre>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td>{ioc}</td>
                      <td colSpan={headers.length}>
                        <em>No data available</em>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          );
        })}
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
            typeof result.data === 'object' && result !== null ? (
              renderTable(Object.entries(result.data))
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