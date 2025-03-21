import React from 'react';

export const SearchResult = ({ result }) => {
  // Helper to determine if an object is empty
  const isEmpty = (obj) => Object.keys(obj).length === 0;

  // Function to render tabular data for each service
  const renderDataTable = (serviceData, serviceName) => {
    // Check if data is empty
    if (!serviceData || isEmpty(serviceData)) {
      return <p>No {serviceName} data available</p>;
    }

    // Handle the array structure for data
    const dataArray = serviceData.data || [];
    
    if (dataArray.length === 0) {
      return <p>No {serviceName} records found</p>;
    }

    return (
      <div className="service-data">
        <h4>{serviceName} Data ({dataArray.length} records)</h4>
        {dataArray.map((item, index) => (
          <div key={index} className="data-record">
            <h5>Record {index + 1}</h5>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(item).map(([key, value]) => (
                  <tr key={key}>
                    <td className="property-name">{key}</td>
                    <td className="property-value">
                      {typeof value === 'object' && value !== null 
                        ? <pre>{JSON.stringify(value, null, 2)}</pre>
                        : String(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  // Dynamically render services from result data
  const renderServices = () => {
    if (!result.data || isEmpty(result.data)) {
      return <p>No data available</p>;
    }

    return Object.entries(result.data).map(([serviceName, serviceData]) => (
      <div key={serviceName}>
        {renderDataTable(serviceData, serviceName.charAt(0).toUpperCase() + serviceName.slice(1))}
      </div>
    ));
  };

  return (
    <div className="result-item">
      <div className="result-header">
        <div className="query-info">
          <strong>Query: {result.query} </strong>
          <span className="timestamp">{new Date(result.timestamp).toLocaleString()}</span>
        </div>
      </div>
      
      <div className="result-details">
        {renderServices()}
      </div>
    </div>
  );
};