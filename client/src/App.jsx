import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import RandomPage from './pages/RandomPage'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'
import Footer from './components/Footer'
import './App.css'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
  }

  return (
    <Router>
      <div className="app">
        <Header user={user} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/random" element={<RandomPage />} />
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