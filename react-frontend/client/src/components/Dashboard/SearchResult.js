import './SearchResult.css';
import React from 'react';

export const SearchResult = ({ result, darkMode }) => {
  console.log('Result passed to SearchResult:', result);
  console.log('Dark mode:', darkMode);

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

  const renderTable = (data) => {
    console.log('Rendering table with current DATA!!!!: ', data);
    if (!Array.isArray(data) || data.length === 0) return null;

    let formattedResults = {};
    let keys = [];

    for (let i = 0; i < data.length; i++) {
      const curr_key = data[i][0];
      if (!keys.includes(String(curr_key))) {
        keys.push(curr_key);
      }

      if (!formattedResults[curr_key]) {
        formattedResults[curr_key] = {
          oil: [],
          pdns: [],
          oil_email: null,
          vpn: null,
          cbr: null,
          asset: null
        };
      }

      for (let j = 0; j < data[i][1].length; j++) {
        const source = data[i][1][j];
        const endpoint = source.source;
        const responseData = source.data?.data || [];

        if (endpoint.includes('oil/email')) {
          formattedResults[curr_key].oil_email = responseData[0] ?? 'No info found';
        } 
        else if (endpoint.includes('oil')) {
          const oilData = Array.isArray(responseData) ? responseData : [responseData];
          formattedResults[curr_key].oil = [
            ...formattedResults[curr_key].oil,
            ...oilData
          ].filter(item => item !== 'No info found');
        }
        else if (endpoint.includes('pdns')) {
          const pdnsData = responseData[0]?.dns?.answers ?? [];
          formattedResults[curr_key].pdns = [
            ...formattedResults[curr_key].pdns,
            ...(Array.isArray(pdnsData) ? pdnsData : [pdnsData])
          ];
        }
        else if (endpoint.includes('vpn')) {
          formattedResults[curr_key].vpn = responseData[0] ?? {};
        }
        else if (endpoint.includes('cbr')) {
          formattedResults[curr_key].cbr = responseData[0] ?? {};
        }
        else if (endpoint.includes('asset')) {
          formattedResults[curr_key].asset = responseData[0] ?? {};
        }
      }
    }

    return (
      <div className={`custom-table-container ${darkMode ? 'dark-mode' : ''}`}>
        {keys.map((ioc) => {
          const iocData = formattedResults[ioc] || {};
          return (
            <OilTable
              key={ioc}
              ioc={ioc}
              oil={Array.isArray(iocData.oil) ? iocData.oil : []}
              pdns={Array.isArray(iocData.pdns) ? iocData.pdns : []}
              vpn={iocData.vpn || {}}
              cbr={iocData.cbr || {}}
              asset={iocData.asset || {}}
              darkMode={darkMode}
            />
          );
        })}
      </div>
    );
  };

  const OilTable = ({ ioc, oil, pdns, vpn, cbr, asset, darkMode }) => {
    const formatForDate = (timestamp) => {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const formatForTime = (timestamp) => {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    };

    const flattenAttributes = (entry) => {
      const excludedAttributes = ['callerIpAddress', 'client', 'megaoil'];
      const attributes = Object.entries(entry || {})
        .filter(([key]) => !excludedAttributes.includes(key));


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

      //PDNS endpoint attributes
      if (entry.count) {
        prioritizedAttributes[1] = ['count', entry.count]
      }

      if (entry.data) {
        prioritizedAttributes[0] = ['count', entry.data]
      }

      if (entry.event) {
        prioritizedAttributes[2] = ['startdate', formatForDate(entry.event.start)];
        prioritizedAttributes[3] = ['starttime', formatForTime(entry.event.start)];
        prioritizedAttributes[6] = ['enddate', formatForDate(entry.event.end)];
        prioritizedAttributes[7] = ['endtime', formatForTime(entry.event.end)];
      }

      if (entry.name) {
        prioritizedAttributes[4] = ['count', entry.name]
      }

      if (entry.type) {
        prioritizedAttributes[5] = ['count', entry.type]
      }

      //VPN endpoint attributes
      if (entry.as) {
        if (entry.as.number) {
          prioritizedAttributes[4] = ['number', entry.as.number]
        }

        if (entry.as.organization.name) {
          prioritizedAttributes[3] = ['orgName', entry.as.organization.name]
        }
      }

      if (entry.geo) {
        if(entry.geo.city_name) {
          prioritizedAttributes[5] = ['city', entry.geo.city_name]
        }

        if(entry.geo.country_iso_code) {
          prioritizedAttributes[7] = ['countryIso', entry.geo.country_iso_code]
        }

        if(entry.geo.region_name) {
          prioritizedAttributes[6] = ['region', entry.geo.region_name]
        }
      }
      
      if (entry.host) {
        if(entry.host.ip?.[0]) {
          prioritizedAttributes[0] = ['hostIp', entry.host.ip[0]]
        }
      }

      if (entry.network) {
        if(entry.network.application) {
          prioritizedAttributes[1] = ['application', entry.network.application]
        }

        if(entry.network.name) {
          prioritizedAttributes[2] = ['applicationName', entry.network.name]
        }
      }

      //CBR endpoint attributes
      if (entry?.process?.host) {
        if (entry.process.host.ip[0]) {
          prioritizedAttributes[0] = ['hostIp', entry.process.host.ip[0]]
        }

        if (entry.process.host.name) {
          prioritizedAttributes[1] = ['hostName', entry.process.host.name]
        }

        if (entry.process.host.type) {
          prioritizedAttributes[2] = ['hostType', entry.process.host.type]
        }

        if (entry.process.host.os.family) {
          prioritizedAttributes[3] = ['hostOs', entry.process.host.os.family]
        }
      }

      if (entry?.process?.pid) {
        prioritizedAttributes[4] = ['pid', entry.process.pid]
      }

      if (entry?.process?.hash?.md5) {
        prioritizedAttributes[5] = ['pid', entry.process.hash.md5]
      }

      if (entry?.process?.start) {
        prioritizedAttributes[6] = ['startdate', formatForDate(entry.process.start)];
        prioritizedAttributes[7] = ['starttime', formatForTime(entry.process.start)];
      }

      // adds remaining attributes, just in case anything is missed
      const remainingAttributes = attributes.filter(
        ([key]) => !prioritizedAttributes.some(([pKey]) => pKey === key)
      );
    
      // fill in remaining positions in the grid with blanks, again, if anything is missed
      let finalAttributes = [...prioritizedAttributes];
      remainingAttributes.forEach(([key, value]) => {
        if (finalAttributes.length < 8) {
          if (/^\d+$/.test(key)) { // Check is key being pushed is a digit (This represents a json key:val object that we don't want printing)
            finalAttributes.push(['-', '']); // If it is then replace is with 'blank' placeholder
          } else {
            finalAttributes.push([key, value]);
          }
        }
      });
    
    
      return Array.from({ length: 8 }, (_, idx) => finalAttributes[idx] || ['-', ''])
        .map(([key, value], idx) => (
          <div key={idx} className="attribute">
            {typeof value === 'object' ? (
              <pre className="nested-object">{JSON.stringify(value, null, 2)}</pre>
            ) : String(value)}
          </div>
        ));
    };

    const generatePivotLinks = (currentIoc) => {
      const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(currentIoc);
      const isDomain = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(currentIoc);
      const encodedIoc = encodeURIComponent(currentIoc);


      const services = [
        {
          name: 'Shodan',
          url: `https://www.shodan.io/search?query=${encodedIoc}`,
          show: isIP
        },
        {
          name: 'VirusTotal',
          url: `https://www.virustotal.com/gui/search/${encodedIoc}`,
          show: true
        },
        {
          name: 'Censys',
          url: `https://search.censys.io/hosts/${encodedIoc}`,
          show: isIP
        },
        {
          name: 'IP2Proxy',
          url: `https://www.ip2location.com/demo/${encodedIoc}`,
          show: isIP
        },
        {
          name: 'GeoIP',
          url: `https://geoiplookup.io/ip/${encodedIoc}`,
          show: isIP
        },
        {
          name: 'Spur',
          url: `https://spur.us/context/${encodedIoc}`,
          show: isIP
        },
        {
          name: 'PassiveDNS',
          url: `https://api.passivedns.io/dns/${encodedIoc}`,
          show: isDomain
        }
      ];

      return services.filter(service => service.show).map((service, idx) => (
        <a
      key={idx}
      href={service.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`pivot-link ${service.name === 'VirusTotal' ? 'active' : ''}`} // Example active state
    >
      {service.name}
    </a>
      ));
    };

    const renderArraySection = (title, data) => {
      if (!Array.isArray(data) || data.length === 0) return null;
      
      return (
        <div className="custom-table-row">
          <div className="custom-table-column security-logs">
            <div>{title}</div>
          </div>
          <div className="custom-table-column entries-container">
            {data.map((entry, idx) => (
              <div key={idx} className="custom-table-entry">
                <div className="attributes-grid">{flattenAttributes(entry)}</div>
                <div className="json-link">
                  <a href="#" onClick={(e) => {
                    e.preventDefault();
                    alert(JSON.stringify(entry, null, 2));
                  }}>
                    Full Pull
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };

    const renderObjectSection = (title, data) => {
      if (!data || typeof data !== 'object' || Object.keys(data).length === 0) return null;

      return (
        <div className="custom-table-row">
          <div className="custom-table-column security-logs">
            <div>{title}</div>
          </div>
          <div className="custom-table-column entries-container">
            <div className="custom-table-entry">
              <div className="attributes-grid">{flattenAttributes(data)}</div>
              <div className="json-link">
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  alert(JSON.stringify(data, null, 2));
                }}>
                  Full Pull
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="custom-table">
      <div className="custom-table-header">
        <div className="ioc-header-container">
          <div className="header-pivot-links">
            <div className="ioc-header-title">{ioc}</div>
            <div className="pivot-links-box">
              {generatePivotLinks(ioc)}
            </div>
          </div>
        </div>
      </div>
  
        {renderArraySection('Security Logs', oil)}
        {renderArraySection('PDNS Logs', pdns)}
        {renderObjectSection('VPN Logs', vpn)}
        {renderObjectSection('CBR Logs', cbr)}
        {renderObjectSection('Asset Data', asset)}
      </div>
    );
  };

  return (
    <div className={`result-item ${darkMode ? 'dark-mode' : ''}`}>
      <div className="result-header">
        <div className="query-info">
          <span className="timestamp bigger-text">
            {result.timestamp ? new Date(result.timestamp).toLocaleString() : ''}
          </span>
        </div>
      </div>
      <div className="result-details">
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