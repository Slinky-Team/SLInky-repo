import React, { useEffect, useState } from 'react'
import { SearchBar } from './SearchBar'

export const SearchButton = ({ searchQuery, setData, setResults}) => {

  const fetchData = async () => {
    if (searchQuery.trim() === "") return //Prevent empty searches

    let endpoint = `/oil?key=${searchQuery.trim()}`

      try {
          const response = await fetch(endpoint, {
              method: "GET",
              headers: {
                  "Authorization": "Basic " + btoa("user:pass"),
                  "Content-Type": "application/json"
              },
          })

          const responseData = await response.json()
          setData(responseData.data || [])
          setResults(responseData.data || [])

          if(responseData.data?.length > 0) {
              console.log("Valid data:", responseData.data)
          } else {
              console.warn("No data found for key: ", searchQuery.trim())
          }
      } catch (error) {
          console.error("Error fetching data: ", error)
      }
  }

  return (
    <div>
        <button onClick={fetchData}>SEARCH</button>
    </div>
  )
}

