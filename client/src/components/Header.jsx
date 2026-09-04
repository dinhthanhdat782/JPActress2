import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getActors } from '../services/api'
import { getOptimizedImageSrcSet, getOptimizedImageUrl } from '../utils/image'
import './Header.css'

const buildMissavSearchUrl = (keyword) => (
  `https://missav.ws/en/search/${encodeURIComponent(keyword.trim())}`
)

function Header({ user, onLogout }) {
  const [query, setQuery] = useState('')
  const [allActors, setAllActors] = useState([])
  const [results, setResults] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const searchRef = useRef(null)
  const lastScrollYRef = useRef(0)
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false)

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
      } catch {
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
      setActiveIndex(0)
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

  useEffect(() => {
    const closeAdminMenu = (event) => {
      if (!event.target.closest?.('.admin-menu')) {
        setIsAdminMenuOpen(false)
      }
    }
    const closeAdminMenuOnEscape = (event) => {
      if (event.key === 'Escape') setIsAdminMenuOpen(false)
    }

    document.addEventListener('mousedown', closeAdminMenu)
    document.addEventListener('keydown', closeAdminMenuOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeAdminMenu)
      document.removeEventListener('keydown', closeAdminMenuOnEscape)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY
      const diff = currentScrollY - lastScrollYRef.current

      if (Math.abs(diff) < 8) return

      if (currentScrollY <= 10) {
        setIsHeaderVisible(true)
      } else if (diff > 0) {
        setIsHeaderVisible(false)
      } else {
        setIsHeaderVisible(true)
      }

      lastScrollYRef.current = currentScrollY
    }

    lastScrollYRef.current = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleKeyDown = (event) => {
    const trimmed = query.trim()
    const missavIndex = results.length
    const optionCount = trimmed ? results.length + 1 : results.length

    if (event.key === 'Enter' && trimmed && !open) {
      event.preventDefault()
      window.open(buildMissavSearchUrl(trimmed), '_blank', 'noopener,noreferrer')
      return
    }

    if (!open || (!optionCount && event.key !== 'Escape')) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((prev) => (prev + 1) % optionCount)
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) => (prev - 1 + optionCount) % optionCount)
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      if (activeIndex === missavIndex && trimmed) {
        window.open(buildMissavSearchUrl(trimmed), '_blank', 'noopener,noreferrer')
        setOpen(false)
        return
      }

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

  const handleLogoutClick = () => {
    setIsAdminMenuOpen(false)
    onLogout()
  }

  const trimmedQuery = query.trim()
  const missavSearchUrl = trimmedQuery ? buildMissavSearchUrl(trimmedQuery) : ''
  const adminPath = user ? '/admin' : '/login'

  return (
    <header className={`header ${isHeaderVisible ? 'header-visible' : 'header-hidden'}`}>
      <div className="header-content">
        <Link to="/" className="logo">
          <img src="/jpactress-logo.svg" alt="JPactress" className="logo-image" />
        </Link>

        <div className="admin-menu mobile-admin-menu">
          <button
            type="button"
            className="mobile-admin-link admin-menu-trigger"
            aria-expanded={isAdminMenuOpen}
            aria-haspopup="menu"
            onClick={() => setIsAdminMenuOpen((isOpen) => !isOpen)}
          >
            ADMIN
          </button>
          {isAdminMenuOpen && (
            <div className="admin-dropdown" role="menu">
              <Link to={adminPath} role="menuitem" onClick={() => setIsAdminMenuOpen(false)}>ADMIN</Link>
              <Link to="/favorites" role="menuitem" onClick={() => setIsAdminMenuOpen(false)}>FAVORITES</Link>
              <Link to="/history" role="menuitem" onClick={() => setIsAdminMenuOpen(false)}>HISTORY</Link>
              <button type="button" role="menuitem" onClick={handleLogoutClick}>LOGOUT</button>
            </div>
          )}
        </div>

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
              {loadingData && (
                <div className="search-status">Loading data...</div>
              )}
              {!loadingData && trimmedQuery && results.length === 0 && (
                <div className="search-status">No actors found</div>
              )}
              {!trimmedQuery ? (
                <div className="search-status">Type a name to search</div>
              ) : (
                <>
                  {results.map((actor, index) => (
                    <a
                      key={actor._id}
                      href={actor.profileLink}
                      target={actor.profileLink?.startsWith('http') ? '_blank' : '_self'}
                      rel="noreferrer"
                      className={`search-item ${index === activeIndex ? 'active' : ''}`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={handlePick}
                    >
                      <img
                        src={getOptimizedImageUrl(actor.imageUrl, 160)}
                        srcSet={getOptimizedImageSrcSet(actor.imageUrl, 80)}
                        sizes="44px"
                        alt={actor.name}
                        loading="lazy"
                      />
                      <div className="search-item-content">
                        <strong>{actor.name}</strong>
                        <span>{actor.tags === 'asian' ? 'Asian' : 'European'}</span>
                      </div>
                    </a>
                  ))}
                  <a
                    href={missavSearchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`search-item missav-search-item ${activeIndex === results.length ? 'active' : ''}`}
                    onMouseEnter={() => setActiveIndex(results.length)}
                    onClick={handlePick}
                  >
                    <span className="missav-search-icon">M</span>
                    <div className="search-item-content">
                      <strong>Search MissAV</strong>
                      <span>{trimmedQuery}</span>
                    </div>
                  </a>
                </>
              )}
            </div>
          )}
        </div>

        <nav className="header-nav">
          <Link to="/">HOME</Link>
          <Link to="/asian">ASIAN</Link>
          <Link to="/european">EUROPEAN</Link>
          <Link to="/series">SERIES</Link>
          <Link to="https://missav.ws/dm223/en" target="_blank" rel="noreferrer">MISSAV</Link>
          <Link to="https://beeg.com/" target="_blank" rel="noreferrer">BEEG</Link>

          <div className="admin-menu desktop-admin-menu">
            <button
              type="button"
              className="desktop-admin-link admin-menu-trigger"
              aria-expanded={isAdminMenuOpen}
              aria-haspopup="menu"
              onClick={() => setIsAdminMenuOpen((isOpen) => !isOpen)}
            >
              ADMIN
            </button>
            {isAdminMenuOpen && (
              <div className="admin-dropdown" role="menu">
                <Link to={adminPath} role="menuitem" onClick={() => setIsAdminMenuOpen(false)}>ADMIN</Link>
                <Link to="/favorites" role="menuitem" onClick={() => setIsAdminMenuOpen(false)}>FAVORITES</Link>
                <Link to="/history" role="menuitem" onClick={() => setIsAdminMenuOpen(false)}>HISTORY</Link>
                <button type="button" role="menuitem" onClick={handleLogoutClick}>LOGOUT</button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
export default Header
