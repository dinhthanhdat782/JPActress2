import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { getMe } from './services/api'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import AsianPage from './pages/AsianPage'
import EuropeanPage from './pages/EuropeanPage'
import SeriesPage from './pages/SeriesPage'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'
import FavoritesPage from './pages/FavoritesPage'
import HistoryPage from './pages/HistoryPage'
import Footer from './components/Footer'
import './App.css'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [pathname])

  return null
}

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (!savedUser) return

    let cancelled = false
    const validateSession = async () => {
      try {
        const parsedUser = JSON.parse(savedUser)
        const response = await getMe(parsedUser.token)
        if (!cancelled) {
          setUser({ ...parsedUser, ...response.data })
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem('user')
          setUser(null)
        }
      }
    }

    validateSession()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const handleExpiredAuth = () => setUser(null)
    window.addEventListener('auth:expired', handleExpiredAuth)
    return () => window.removeEventListener('auth:expired', handleExpiredAuth)
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="app">
        <Header user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/asian" element={<AsianPage />} />
            <Route path="/europian" element={<EuropeanPage />} />
            <Route path="/european" element={<EuropeanPage />} />
            <Route path="/series" element={<SeriesPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/admin" element={<AdminPage user={user} onLogout={handleLogout} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
