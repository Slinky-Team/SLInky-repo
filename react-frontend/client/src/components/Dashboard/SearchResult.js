import './SearchResult.css';
import React from 'react';

export const SearchResult = ({ result, darkMode }) => {
  console.log('Result passed to SearchResult:', result);
  console.log('Dark mode:', darkMode);

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
    //this formats the timestamp that oil gives it into a date
    const formatForDate = (timestamp) => {
      // Parse the string timestamp into a Date object
      const date = new Date(timestamp);
    
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date'; // Handle invalid timestamps gracefully
      }
    
      // Format the date into a readable string
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    //this formats the timestamp that oil gives it into a TIME aka removes date
    const formatForTime = (timestamp) => {
      // parse the string timestamp into a date object
      const date = new Date(timestamp);
    
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date'; // Handle invalid timestamps gracefully
      }
    
      // Format the date into a readable string
      return date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    };
    const flattenAttributes = (entry) => {
      // List of attributes to exclude
      const excludedAttributes = ['callerIpAddress', 'client', 'megaoil'];
    
      // Filter out excluded attributes
      const attributes = Object.entries(entry || {})
        .filter(([key]) => !excludedAttributes.includes(key));

      const formatForDate = (timestamp) => {
            // Parse the string timestamp into a Date object
            const date = new Date(timestamp);
          
            // Check if the date is valid
            if (isNaN(date.getTime())) {
              return 'Invalid Date'; // Handle invalid timestamps gracefully
            }
          
            // Format the date into a readable string
            return date.toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
          };  

      // Prioritize specific attributes
      // THIS IS THE PART TO COPY WHEN ADDING NEW ENDPOINTS
      // This is how it will be formatted, use your head and figure it out
      // you got this!
      const prioritizedAttributes = [];
      if (entry.oil === 'azure') {
        if (entry.key) {
          prioritizedAttributes[0] = ['key', entry.key];
        }
        if (entry.coxAccountName) {
          prioritizedAttributes[1] = ['accountName', entry.coxAccountName];
        }
        if (entry.timestamp) {
          prioritizedAttributes[2] = ['date', formatForDate(entry.timestamp)];
          prioritizedAttributes[3] = ['time', formatForTime(entry.timestamp)];
        }
        if (entry.userDisplayName) {
          prioritizedAttributes[4] = ['name', entry.userDisplayName];
        }
        if (entry.userPrincipalName) {
          prioritizedAttributes[5] = ['email', entry.userPrincipalName];
        }
        if (entry.oil) {
          prioritizedAttributes[6] = ['source', entry.oil.charAt(0).toUpperCase() + entry.oil.slice(1)];
        }
        prioritizedAttributes[7] = ['empty', ''];
      }

      if (entry.oil === 'coxsight') {
        if (entry.key) {
          prioritizedAttributes[0] = ['key', entry.key];
        }
        if (entry.user.email) {
          prioritizedAttributes[1] = ['accountName', entry.user.name];
        }
        if (entry.timestamp) {
          prioritizedAttributes[2] = ['date', formatForDate(entry.timestamp)];
          prioritizedAttributes[3] = ['time', formatForTime(entry.timestamp)];
        }
        if (entry.user.full_name) {
          prioritizedAttributes[4] = ['fullName', entry.user.full_name];
        }
        if (entry.user.email) {
          prioritizedAttributes[5] = ['email', entry.user.email];
        }
        if (entry.oil) {
          prioritizedAttributes[6] = ['source', entry.oil.charAt(0).toUpperCase() + entry.oil.slice(1)];
        }
        if (entry.event.type) {
          if (entry.event.outcome === 'success') {
            prioritizedAttributes[7] = ['access', 'Access Granted'];
          }
          else {
          prioritizedAttributes[7] = ['access', 'Access Denied'];
          }
        }
      }

      if (entry.oil === 'email') {
        if (entry.email) {
          prioritizedAttributes[0] = ['from', entry.email.from.address];
          prioritizedAttributes[4] = ['to', entry.email.to.address];
          prioritizedAttributes[5] = ['subject', entry.email.subject];
        }
        if (entry.key) {
          prioritizedAttributes[1] = ['key', entry.key];
        }
        if (entry.timestamp) {
          prioritizedAttributes[2] = ['date', formatForDate(entry.timestamp)];
          prioritizedAttributes[3] = ['time', formatForTime(entry.timestamp)];
        }
        if (entry.oil) {
          prioritizedAttributes[6] = ['source', entry.oil.charAt(0).toUpperCase() + entry.oil.slice(1)];
        }
        prioritizedAttributes[7] = ['empty', ''];
      }

      if (entry.oil === 'helios') {
        if (entry.source) {
          prioritizedAttributes[0] = ['source', entry.source.ip];
          prioritizedAttributes[1] = ['sourcePort', entry.source.port];
          prioritizedAttributes[7] = ['sourceGeo', entry.source.geo.country_iso_code + ', ' + entry.source.geo.city_name];
        }
        entry.timestamp = entry["@timestamp"];
        if (entry["@timestamp"]) {
          prioritizedAttributes[2] = ['date', formatForDate(entry.timestamp)];
          prioritizedAttributes[3] = ['time', formatForTime(entry.timestamp)];
        }
        if (entry.destination) {
          prioritizedAttributes[4] = ['destination', entry.destination.ip];
          prioritizedAttributes[5] = ['destinationPort', entry.destination.port];
        }
        if (entry.oil) {
          prioritizedAttributes[6] = ['source', entry.oil.charAt(0).toUpperCase() + entry.oil.slice(1)];
        }
      }

      if (entry.oil === 'netflow') {
        if (entry.source) {
          prioritizedAttributes[0] = ['source', entry.source.ip];
          prioritizedAttributes[1] = ['sourcePort', entry.source.port];
        }
        if (entry.event) {
          prioritizedAttributes[2] = ['startDate', formatForDate(entry.event.start)];
          prioritizedAttributes[3] = ['startTime', formatForTime(entry.event.start)];
          prioritizedAttributes[6] = ['endDate', formatForDate(entry.event.end)];
          prioritizedAttributes[7] = ['endTime', formatForTime(entry.event.end)];
        }
        if (entry.destination) {
          prioritizedAttributes[4] = ['destination', entry.destination.ip];
          prioritizedAttributes[5] = ['destinationPort', entry.destination.port];
        }
      }

      if (entry.oil === 'okta') {
        if (entry.key) {
          prioritizedAttributes[0] = ['key', entry.key];
        }
        if (entry.displayMessage) {
          prioritizedAttributes[1] = ['displayMessage', entry.displayMessage.split(" from")[0]];
        }
        if (entry.timestamp) {
          prioritizedAttributes[2] = ['date', formatForDate(entry.timestamp)];
          prioritizedAttributes[3] = ['time', formatForTime(entry.timestamp)];
        }
        if (entry.target) {
          prioritizedAttributes[4] = ['name', entry.target[0]?.displayName];
          prioritizedAttributes[5] = ['email', entry.target[0]?.alternateId]; 
        }
        if (entry.oil) {
          prioritizedAttributes[6] = ['source', entry.oil.charAt(0).toUpperCase() + entry.oil.slice(1)];
        }
        prioritizedAttributes[7] = ['empty', ''];
      }

      if (entry.oil === 'prisma' || entry.oil === 'suricata') {
        if (entry.source) {
          prioritizedAttributes[0] = ['source', entry.source.ip];
          prioritizedAttributes[1] = ['sourcePort', entry.source.port];
          prioritizedAttributes[7] = ['sourceGeo', entry.source.geo.country_iso_code + ', ' + entry.source.geo.city_name];
        }
        entry.timestamp = entry["@timestamp"];
        if (entry["@timestamp"]) {
          prioritizedAttributes[2] = ['date', formatForDate(entry.timestamp)];
          prioritizedAttributes[3] = ['time', formatForTime(entry.timestamp)];
        }
        if (entry.destination) {
          prioritizedAttributes[4] = ['destination', entry.destination.ip];
          prioritizedAttributes[5] = ['destinationPort', entry.destination.port];
        }
        if (entry.oil) {
          prioritizedAttributes[6] = ['source', entry.oil.charAt(0).toUpperCase() + entry.oil.slice(1)];
        }
      }
    
      // adds remaining attributes, just in case anything is missed
      const remainingAttributes = attributes.filter(
        ([key]) => !prioritizedAttributes.some(([pKey]) => pKey === key)
      );
    
      // fill in remaining positions in the grid with blanks, again, if anything is missed
      let finalAttributes = [...prioritizedAttributes];
      remainingAttributes.forEach(([key, value]) => {
        if (finalAttributes.length < 8) {
          finalAttributes.push([key, value]);
        }
      });
    
      finalAttributes = Array.from({ length: 8 }, (_, idx) => finalAttributes[idx] || ['-', '']);
    
      // render attributes in the 2x4 grid
      // if you want to make the value turn red if the value matches the key
      // you'd probably want to start looking somewhere here first.
      return finalAttributes.map(([key, value], idx) => (
        <div key={idx} className="attribute">
          {typeof value === 'object' && value !== null ? (
            <pre className="nested-object">
              {JSON.stringify(value, null, 2)}
            </pre>
          ) : (
            String(value)
          )}
        </div>
      ));
    };
  
    return (
      <div className={`custom-table-container ${darkMode ? 'dark-mode' : ''}`}>
        {keys.map((ioc) => {
          const entries = data[ioc]?.oil;
          if (!entries || entries.length === 0) return null;
  
          // separate entries if they're netflow
          const netflowEntries = entries.filter((entry) => entry.oil === 'netflow');
          const otherEntries = entries.filter((entry) => entry.oil !== 'netflow');
  
          return (
            <div key={ioc} className="custom-table">
              <div className="custom-table-header">
                <h3>{ioc}</h3>
              </div>
              <div className="custom-table-row">
                {/* Left column: Security logs */}
                <div className="custom-table-column security-logs">
                  <strong>Security Logs</strong>
                </div>
  
                {/* right column: not-netflow entries */}
                <div className="custom-table-column entries-container">
                  {otherEntries.map((entry, idx) => (
                    <div key={idx} className="custom-table-entry">
                      <div className="attributes-grid">{flattenAttributes(entry)}</div>
                      <div className="json-link">
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault(); // Prevent default link behavior
                            alert(JSON.stringify(entry, null, 2)); // Display JSON in an alert
                          }}
                        >
                          Full Pull
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {netflowEntries.length > 0 && (
                <div className="custom-table-row">
                  <div className="custom-table-column security-logs">
                    <div>Netflow</div>
                  </div>
                  <div className="custom-table-column entries-container">
                    {netflowEntries.map((entry, idx) => (
                      <div key={`netflow-${idx}`} className="custom-table-entry">
                        <div className="attributes-grid">{flattenAttributes(entry)}</div>
                        <div className="json-link">
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault(); // Prevent default link behavior
                            alert(JSON.stringify(entry, null, 2)); // Display JSON in an alert
                          }}
                        >
                          Full Pull
                        </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`result-item ${darkMode ? 'dark-mode' : ''}`}>
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