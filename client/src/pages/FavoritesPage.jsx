import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getFavorites, recordHistory } from '../services/api'
import { getOptimizedImageSrcSet, getOptimizedImageUrl } from '../utils/image'
import FavoriteButton from '../components/FavoriteButton'
import './FavoritesPage.css'

function FavoritesPage() {
  const [favorites, setFavorites] = useState({ actors: [], series: [] })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    getFavorites()
      .then((response) => {
        if (!cancelled) setFavorites(response.data || { actors: [], series: [] })
      })
      .catch((error) => {
        if (error.response?.status === 401) navigate('/login')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [navigate])

  const renderItems = (items, type) => (
    <div className="favorites-grid">
      {items.map((item) => (
        <a
          key={item._id}
          className="category-card"
          href={item.profileLink}
          target={item.profileLink?.startsWith('http') ? '_blank' : '_self'}
          rel="noreferrer"
          onClick={() => recordHistory(type, item._id, 'view').catch(() => {})}
        >
          <div className="category-image-wrap">
            <FavoriteButton type={type} id={item._id} initialFavorite />
            <img
              src={getOptimizedImageUrl(item.imageUrl, 700)}
              srcSet={getOptimizedImageSrcSet(item.imageUrl, 350)}
              sizes="(max-width: 768px) 48vw, 22vw"
              alt={item.name}
              loading="lazy"
            />
            <div className="category-overlay"><span className="category-name">{item.name}</span></div>
          </div>
        </a>
      ))}
    </div>
  )

  const asianActors = favorites.actors.filter((item) => item.tags === 'asian')
  const europeanActors = favorites.actors.filter((item) => item.tags === 'european')

  if (loading) return <div className="favorites-page"><p>Loading favorites...</p></div>

  return (
    <div className="favorites-page">
      <div className="category-head">
        <h2>Favorites</h2>
        <p>Your saved actors and series.</p>
      </div>
      <section className="favorites-section">
        <h3>Actors</h3>
        <div className="favorites-subsection">
          <h4>ASIAN</h4>
          {asianActors.length ? renderItems(asianActors, 'actor') : <p className="favorites-empty">No saved Asian actors yet.</p>}
        </div>
        <div className="favorites-subsection">
          <h4>EUROPEAN</h4>
          {europeanActors.length ? renderItems(europeanActors, 'actor') : <p className="favorites-empty">No saved European actors yet.</p>}
        </div>
      </section>
      <section className="favorites-section">
        <h3>Series</h3>
        {favorites.series.length ? renderItems(favorites.series, 'series') : <p className="favorites-empty">No saved series yet.</p>}
      </section>
      <Link to="/" className="favorites-back">Back to home</Link>
    </div>
  )
}

export default FavoritesPage
