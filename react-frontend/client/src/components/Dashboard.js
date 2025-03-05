import React, { useState } from 'react';

const Dashboard = () => {
  const [inputText, setInputText] = useState('');

  const handleSearch = () => {
    console.log("Searching for:", inputText);
    // Add search logic here (API call, filtering, etc.)
  };

  const handleExport = () => {
    console.log("Exporting CSV");
    // Implement CSV export functionality
  };

  return (
    <div className="container-fluid mt-3">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3">
          <div className="p-3 border rounded bg-light" style={{ height: '600px', overflowY: 'auto' }}>
            <h5>Search IP/Hostname</h5>
            <textarea
              className="form-control"
              rows="10"
              placeholder="Paste IPs here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button className="btn btn-success w-100 mt-2" onClick={handleSearch}>
              Search
            </button>
            <div className="mt-3">
              <span className="text-primary">○ Defanged</span>
              <span className="text-danger ms-3">○ Fanged</span>
            </div>
            <button className="btn btn-success w-100 mt-2" onClick={handleExport}>
              Export CSV
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9">
          <div
            className="p-3 border rounded"
            style={{
              background: 'linear-gradient(to right, #009ffd, #2a2a72)',
              color: 'white',
              minHeight: '600px',
              overflowY: 'auto',
            }}
          >
            <h5>Internal Lookup Results</h5>
            <div
              className="bg-white p-2 rounded text-dark"
              style={{ minHeight: '500px', maxHeight: '600px', overflowY: 'auto' }}
            >
              [Data Table Here]
            </div>
            <button className="btn btn-success mt-2" onClick={handleExport}>
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
