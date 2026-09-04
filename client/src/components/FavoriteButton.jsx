import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toggleFavorite } from '../services/api'
import './FavoriteButton.css'

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}

function FavoriteButton({ type, id, initialFavorite = false }) {
  const [favorited, setFavorited] = useState(initialFavorite)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setFavorited(initialFavorite)
  }, [initialFavorite])

  const handleClick = async (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (!getStoredUser()?.token) {
      navigate('/login')
      return
    }

    setLoading(true)
    try {
      const response = await toggleFavorite(type, id)
      setFavorited(Boolean(response.data?.favorited))
    } catch (error) {
      if (error.response?.status !== 401) console.error('Error toggling favorite:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      className={`favorite-button ${favorited ? 'is-favorite' : ''}`}
      onClick={handleClick}
      disabled={loading}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {favorited ? '♥' : '♡'}
    </button>
  )
}

export default FavoriteButton
