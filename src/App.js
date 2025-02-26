import React, { useState } from 'react';
import "./logo.svg"
import './App.css';

function App() {

  const [text, setText] =
  useState("Text Display");

  const [editing, setEditing] =
  useState(false);

  function replacePeriods(input) {
    return input.replace(/\./g, '[.]');
  }


  
  return (
    <div className="App">
      <header className="App-header">
        <img src="https://res.cloudinary.com/dnalq36cn/image/upload/v1737567747/SLInky_1-0-1_HalfSize_wjjqqz.png" alt="Logo"></img>
        <p>Slinky Development Server</p>

        <p>
        {editing ? (
          <>
            <input 
              value={text}
              
              onChange={(e) =>
                setText(e.target.value)
              }
            />
            <button
              onClick={() =>
                setEditing(false)
              }
            >
              Save inputbox
            </button>
          </>
        ) : (
          <>
          <span>{replacePeriods(text)}</span>
          <button
            onClick={() =>
              setEditing(true)
            }
          >
            Edit Inputbox
          </button>
          </>
        )
        }
        </p>
      </header>
    </div>
  );
}

export default App;