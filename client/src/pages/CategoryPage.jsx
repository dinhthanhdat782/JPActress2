import { useEffect, useState } from 'react'
import { getActors, getSeries } from '../services/api'
import { getOptimizedImageSrcSet, getOptimizedImageUrl } from '../utils/image'
import './CategoryPage.css'

function CategoryPage({ title, tag, type = 'actors' }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(12)

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

  useEffect(() => {
    setVisibleCount(12)
  }, [tag, type])

  return (
    <div className="category-page">
      <div className="category-head">
        <h2>{title}</h2>
        <p>Explore our curated collection of high-quality cinematic {type === 'series' ? 'series' : 'talent'}.</p>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="category-grid">
            {items.slice(0, visibleCount).map((item) => (
              <a
                key={item._id}
                className="category-card"
                href={item.profileLink}
                target={item.profileLink?.startsWith('http') ? '_blank' : '_self'}
                rel="noreferrer"
              >
                <div className="category-image-wrap">
                  <img
                    src={getOptimizedImageUrl(item.imageUrl, 700)}
                    srcSet={getOptimizedImageSrcSet(item.imageUrl, 350)}
                    sizes="(max-width: 768px) 48vw, (max-width: 1200px) 30vw, 22vw"
                    alt={item.name}
                    loading="lazy"
                  />
                  <div className="category-overlay">
                    <span className="category-name">{item.name}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
          {visibleCount < items.length && (
            <div className="category-load-wrap">
              <button className="category-load-more" onClick={() => setVisibleCount((prev) => prev + 12)}>
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CategoryPage
