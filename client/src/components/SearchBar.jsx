import { useState } from 'react'
import './SearchBar.css'

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search actors..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            onSearch(e.target.value)
          }}
          className="search-input"
        />
      </div>
    </form>
  )
}

export default SearchBar