import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getActors } from '../services/api'
import './Header.css'

function Header({ user }) {
  const [query, setQuery] = useState('')
  const [allActors, setAllActors] = useState([])
  const [results, setResults] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const searchRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    const loadActors = async () => {
      setLoadingData(true)
      try {
        const [asianRes, europeanRes] = await Promise.all([
          getActors(1, 200, 'asian'),
          getActors(1, 200, 'european'),
        ])
        if (!cancelled) {
          const merged = [...(asianRes.data || []), ...(europeanRes.data || [])]
          setAllActors(merged)
        }
      } catch (error) {
        if (!cancelled) setAllActors([])
      } finally {
        if (!cancelled) setLoadingData(false)
      }
    }

    loadActors()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setOpen(false)
      setActiveIndex(-1)
      return
    }

    const timeout = setTimeout(() => {
      const keyword = trimmed.toLowerCase()
      const items = allActors
        .filter((actor) => actor.name.toLowerCase().includes(keyword))
        .slice(0, 8)
      setResults(items)
      setOpen(true)
      setActiveIndex(items.length ? 0 : -1)
    }, 120)

    return () => {
      clearTimeout(timeout)
    }
  }, [query, allActors])

  useEffect(() => {
    const onClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const handleKeyDown = (event) => {
    if (!open || (!results.length && event.key !== 'Escape')) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((prev) => (prev + 1) % results.length)
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length)
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      const picked = results[activeIndex]
      if (picked?.profileLink) {
        const isExternal = picked.profileLink.startsWith('http')
        if (isExternal) {
          window.open(picked.profileLink, '_blank', 'noopener,noreferrer')
        } else {
          window.location.href = picked.profileLink
        }
      }
    }

    if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  const handlePick = () => {
    setOpen(false)
  }

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <h1>JPactress</h1>
          <p className="logo-subtitle">TALENT AGENCY</p>
        </Link>

        <div className="header-search" ref={searchRef}>
          <input
            type="text"
            placeholder="SEARCH ACTORS..."
            aria-label="Search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
            }}
            onFocus={() => query.trim() && setOpen(true)}
            onKeyDown={handleKeyDown}
          />
          {open && (
            <div className="search-dropdown">
              {loadingData ? (
                <div className="search-status">Loading data...</div>
              ) : query.trim() && results.length === 0 ? (
                <div className="search-status">No actors found</div>
              ) : !query.trim() ? (
                <div className="search-status">Type a name to search</div>
              ) : (
                results.map((actor, index) => (
                  <a
                    key={actor._id}
                    href={actor.profileLink}
                    target={actor.profileLink?.startsWith('http') ? '_blank' : '_self'}
                    rel="noreferrer"
                    className={`search-item ${index === activeIndex ? 'active' : ''}`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={handlePick}
                  >
                    <img src={actor.imageUrl} alt={actor.name} />
                    <div className="search-item-content">
                      <strong>{actor.name}</strong>
                      <span>{actor.tags === 'asian' ? 'Asian' : 'European'}</span>
                    </div>
                  </a>
                ))
              )}
            </div>
          )}
        </div>

        <nav className="header-nav">
          <Link to="/">HOME</Link>
          <Link to="/asian">ASIAN</Link>
          <Link to="/europian">EUROPIAN</Link>
          <Link to="https://missav.ws/dm223/en" target="_blank" rel="noreferrer">MISSAV</Link>
          <Link to="https://beeg.com/" target="_blank" rel="noreferrer">BEEG</Link>

          {user ? (
            <Link to="/admin">ADMIN</Link>
          ) : (
            <Link to="/login">ADMIN</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
export default Header
