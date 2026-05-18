import { useEffect, useState } from 'react'
import { getActors, getSeries } from '../services/api'
import './CategoryPage.css'

function CategoryPage({ title, tag, type = 'actors' }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true)
      try {
        const data = type === 'series'
          ? await getSeries(1, 60)
          : await getActors(1, 60, tag)
        setItems(data.data || [])
      } catch (error) {
        console.error(`Error fetching ${type}:`, error)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [tag, type])

  return (
    <div className="category-page">
      <h2>{title}</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="category-grid">
          {items.map((item) => (
            <a
              key={item._id}
              className="category-card"
              href={item.profileLink}
              target={item.profileLink?.startsWith('http') ? '_blank' : '_self'}
              rel="noreferrer"
            >
              <div className="category-image-wrap">
                <img src={item.imageUrl} alt={item.name} />
                <div className="category-overlay">
                  <span className="category-name">{item.name}</span>
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
