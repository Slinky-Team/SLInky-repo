import './SearchResult.css';
import React from 'react';

export const SearchResult = ({ result }) => {
  console.log('Result passed to SearchResult:', result);

  //this is the thing that actually converts the json to a table
  const renderTable = (data) => {
    if (!Array.isArray(data)) return null;
    //it first grabs the headers from the very first object in the array
    //(which is a bad idea and should 100% be changed ASAP)
    const headers = Object.keys(data[0]?.threat?.indicator || {});
    return (
      //then it returns a table using result-table classname for CSS
      //where it says "{header === "ip" ? header.toUpperCase() : header}"
      //it just checks if the header is "ip" and if it is, then it makes it uppercase
      //otherwise it just returns the header as is
      //then it loops through the data and for each item, it loops through the headers again
      <table className="result-table">
        <thead>
          <tr> 
            {headers.map((header) => (
              <th key={header}>
                {header === "ip" ? header.toUpperCase() : header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td key={header}>{item.threat?.indicator[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="result-item">
      <div className="result-header">
        <div className="query-info">
          <span className="timestamp">{new Date(result.timestamp).toLocaleString()}</span>
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