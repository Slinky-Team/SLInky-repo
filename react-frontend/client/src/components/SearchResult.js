import React from 'react'

import "./SearchResult.css"

export const SearchResult = ({result}) => {
  return (
    <div className='search-result'
    onClick={(e) => alert(`Result Data:\n${JSON.stringify(result, null, 2)}`)}>
        <p>
          Source Ip: {result.oil === "azure" ? "azure - " + result.callerIpAddress :
          result.oil === "coxsight" ? "coxsight - " + result.source.ip :
          result.oil === "email" ? "email - " + result.source.ip :
          result.oil === "helios" ? "helios - " + result.source.ip :
          result.oil === "netflow" ? "netflow - " + result.source.ip :
          result.oil === "okta" ? "okta - " + result.client.ipAddress :
          result.oil === "prisma" ? "prisma - " + result.source.ip :
          result.oil === "suricata" ? "suricata - " + result.source.ip : "N/A"}
        </p>
    </div>
  )
}
