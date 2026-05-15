import { useEffect, useState } from 'react'
import { getActors } from '../services/api'
import './CategoryPage.css'

function CategoryPage({ title, tag }) {
  const [actors, setActors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActors = async () => {
      setLoading(true)
      try {
        const data = await getActors(1, 60, tag)
        setActors(data.data || [])
      } catch (error) {
        console.error(`Error fetching ${tag} actors:`, error)
      } finally {
        setLoading(false)
      }
    }

    fetchActors()
  }, [tag])

  return (
    <div className="category-page">
      <h2>{title}</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="category-grid">
          {actors.map((actor) => (
            <a
              key={actor._id}
              className="category-card"
              href={actor.profileLink}
              target={actor.profileLink?.startsWith('http') ? '_blank' : '_self'}
              rel="noreferrer"
            >
              <div className="category-image-wrap">
                <img src={actor.imageUrl} alt={actor.name} />
                <div className="category-overlay">
                  <span className="category-name">{actor.name}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default CategoryPage
