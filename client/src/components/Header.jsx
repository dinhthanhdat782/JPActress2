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
        <nav className="header-nav">
          <Link to="/">HOME</Link>
          <Link to="/random">RANDOM</Link>
          <Link to="https://missav.ws/dm223/en">MISSAV</Link>
          <Link to="https://beeg.com/">BEEG</Link>

          {user ? (
            <Link to="/admin">DASHBOARD</Link>
          ) : (
            <Link to="/login">ADMIN</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
export default Header