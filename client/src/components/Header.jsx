import { Link } from 'react-router-dom'
import './Header.css'

function Header({ user }) {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">Logo</Link>

        <div className="header-search">
          <input type="text" placeholder="Search Bar" aria-label="Search" />
        </div>

        <nav className="header-nav">
          <Link to="/">Home</Link>
          <Link to="/asian">Asian</Link>
          <Link to="/europian">Europian</Link>
          <Link to="https://missav.ws/dm223/en" target="_blank" rel="noreferrer">MissAV</Link>
          <Link to="https://beeg.com/" target="_blank" rel="noreferrer">Beeg</Link>

          {user ? (
            <Link to="/admin">Admin</Link>
          ) : (
            <Link to="/login">Admin</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
export default Header
