import React, {useState} from 'react'

import "./SearchBar.css"

export const SearchBar = ({ setSearchQuery, searchQuery }) => {
  return (
    <div className='input-wrapper'>
        <input placeholder='Type to search...'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}/>
    </div>
  )
}
