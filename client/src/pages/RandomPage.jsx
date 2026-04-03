import { useState } from 'react'
import { getRandomActor } from '../services/api'
import './RandomPage.css'

function RandomPage() {
  const [currentActor, setCurrentActor] = useState(null)
  const [history, setHistory] = useState([])
  const [excludeIds, setExcludeIds] = useState([])
  const [selectedTag, setSelectedTag] = useState('')
  const [remaining, setRemaining] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isRevealing, setIsRevealing] = useState(false)
  const [noMore, setNoMore] = useState(false)

  const handleRandom = async () => {
    setLoading(true)
    setIsRevealing(false)
    setNoMore(false)

    try {
      const data = await getRandomActor(selectedTag, excludeIds)

      if (!data.data) {
        setNoMore(true)
        setCurrentActor(null)
        setRemaining(0)
        setLoading(false)
        return
      }

      // Animation: hiện card sau 1 giây
      setTimeout(() => {
        setCurrentActor(data.data)
        setRemaining(data.remaining)
        setIsRevealing(true)

        // Thêm vào lịch sử & exclude
        setHistory((prev) => [data.data, ...prev])
        setExcludeIds((prev) => [...prev, data.data._id])

        setLoading(false)
      }, 800)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  const handleTagChange = (tag) => {
    setSelectedTag(tag)
    // Reset khi đổi tag
    setCurrentActor(null)
    setHistory([])
    setExcludeIds([])
    setRemaining(null)
    setNoMore(false)
    setIsRevealing(false)
  }

  const handleReset = () => {
    setCurrentActor(null)
    setHistory([])
    setExcludeIds([])
    setRemaining(null)
    setNoMore(false)
    setIsRevealing(false)
  }

  return (
    <div className="random-page">
      {/* Header */}
      <div className="random-header">
        <h2>RANDOM PICK</h2>
        <p>Discover talent by chance — let fate decide</p>
      </div>

      {/* Tag Filter */}
      <div className="random-filters">
        <button
          className={`random-tag ${selectedTag === '' ? 'active' : ''}`}
          onClick={() => handleTagChange('')}
        >
          ALL
        </button>
        <button
          className={`random-tag ${selectedTag === 'asian' ? 'active' : ''}`}
          onClick={() => handleTagChange('asian')}
        >
          ASIAN
        </button>
        <button
          className={`random-tag ${selectedTag === 'european' ? 'active' : ''}`}
          onClick={() => handleTagChange('european')}
        >
          EUROPEAN
        </button>
      </div>

      {/* Random Button */}
      <div className="random-action">
        <button
          className={`btn-random ${loading ? 'spinning' : ''}`}
          onClick={handleRandom}
          disabled={loading || noMore}
        >
          {loading ? '✦ DRAWING...' : noMore ? 'NO MORE ACTORS' : '✦ RANDOM PICK'}
        </button>

        {history.length > 0 && (
          <button className="btn-reset" onClick={handleReset}>
            ↺ RESET
          </button>
        )}
      </div>

      {/* Remaining count */}
      {remaining !== null && (
        <p className="remaining-count">
          {remaining} actor{remaining !== 1 ? 's' : ''} remaining
        </p>
      )}

      {/* Current Random Result */}
      {loading && (
        <div className="random-card-area">
          <div className="card-placeholder">
            <div className="card-shimmer"></div>
            <p>Drawing...</p>
          </div>
        </div>
      )}

      {!loading && currentActor && (
        <div className="random-card-area">
          <div className={`random-card ${isRevealing ? 'revealed' : ''}`}>
            <div className="random-card-inner">
              <div className="random-card-image">
                <img src={currentActor.imageUrl} alt={currentActor.name} />
                <div className="random-card-gradient"></div>
              </div>
              <div className="random-card-info">
                <span className={`random-card-tag tag-${currentActor.tags}`}>
                  {currentActor.tags?.toUpperCase()}
                </span>
                <h3>{currentActor.name}</h3>
                <a
                  href={currentActor.profileLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="random-card-link"
                >
                  VIEW PROFILE →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && noMore && (
        <div className="random-card-area">
          <div className="no-more">
            <span className="no-more-icon">✓</span>
            <h3>ALL DONE!</h3>
            <p>You've gone through all available actors</p>
            <button className="btn-reset-large" onClick={handleReset}>
              START OVER
            </button>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="random-history">
          <div className="history-header">
            <h3>HISTORY</h3>
            <span className="history-count">{history.length} picked</span>
          </div>
          <div className="history-list">
            {history.map((actor, index) => (
              <div key={`${actor._id}-${index}`} className="history-item">
                <img src={actor.imageUrl} alt={actor.name} />
                <div className="history-item-info">
                  <span className="history-name">{actor.name}</span>
                  <span className={`history-tag tag-${actor.tags}`}>
                    {actor.tags?.toUpperCase()}
                  </span>
                </div>
                <span className="history-number">#{history.length - index}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RandomPage