import React, {useState, useEffect} from 'react'
import "./App.css"
import { SearchBar } from './components/SearchBar'
import { SearchResultsList } from './components/SearchResultsList'
import { SearchButton } from './components/SearchButton'

function App() {
  const [data, setData] = useState([])
  const [results, setResults] = useState([])
  const [searchQuery, setSearchQuery] = useState(""); // Track user input

  // Build website here
  return (
    <div className='App'>
      <div className='search-bar-container'>
        <SearchBar setSearchQuery={setSearchQuery} searchQuery={searchQuery} />
        <SearchButton searchQuery={searchQuery} setData={setData} setResults={setResults} />
        <SearchResultsList results={results} />
      </div>
    </div>
  )
}

export default App