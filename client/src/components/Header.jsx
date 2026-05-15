import { Link } from 'react-router-dom'
import './Header.css'

function Header({ user }) {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <h1>JPactress</h1>
          <p className="logo-subtitle">TALENT AGENCY</p>
        </Link>

        <div className="header-search">
          <input type="text" placeholder="SEARCH ACTORS..." aria-label="Search" />
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
