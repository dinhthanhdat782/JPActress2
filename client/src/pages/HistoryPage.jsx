import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearHistory, getHistory } from '../services/api'
import { getOptimizedImageSrcSet, getOptimizedImageUrl } from '../utils/image'
import './HistoryPage.css'

function HistoryPage() {
  const [items, setItems] = useState([])
  const [activeTab, setActiveTab] = useState('viewed')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getHistory()
      .then((response) => setItems(response.data || []))
      .catch((error) => {
        if (error.response?.status === 401) navigate('/login')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  const handleClear = async () => {
    if (!window.confirm('Clear your viewing and random history?')) return
    await clearHistory()
    setItems([])
  }

  const visibleItems = items.filter((entry) => (
    activeTab === 'pick' ? entry.action === 'random' : entry.action === 'view'
  ))

  return (
    <div className="history-page">
      <div className="history-head">
        <div><h2>History</h2><p>Your recent views and random picks.</p></div>
        {!!items.length && <button className="history-clear" onClick={handleClear}>CLEAR HISTORY</button>}
      </div>
      {!loading && !!items.length && (
        <div className="history-tabs" role="tablist" aria-label="History type">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'viewed'}
            className={activeTab === 'viewed' ? 'active' : ''}
            onClick={() => setActiveTab('viewed')}
          >
            VIEWED <span>{items.filter((entry) => entry.action === 'view').length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'pick'}
            className={activeTab === 'pick' ? 'active' : ''}
            onClick={() => setActiveTab('pick')}
          >
            PICK <span>{items.filter((entry) => entry.action === 'random').length}</span>
          </button>
        </div>
      )}
      {loading ? <p>Loading history...</p> : !items.length ? (
        <p className="history-empty">Your history is empty.</p>
      ) : !visibleItems.length ? (
        <p className="history-empty">No {activeTab === 'pick' ? 'random picks' : 'viewed items'} yet.</p>
      ) : (
        <div className="history-list">
          {visibleItems.map((entry) => {
            const item = entry.actor || entry.series
            if (!item) return null
            return (
              <a key={entry._id} className="history-item" href={item.profileLink} target="_blank" rel="noreferrer">
                <img src={getOptimizedImageUrl(item.imageUrl, 180)} srcSet={getOptimizedImageSrcSet(item.imageUrl, 90)} alt={item.name} />
                <div><strong>{item.name}</strong><span>{entry.action === 'random' ? 'Random pick' : 'Viewed'} · {new Date(entry.createdAt).toLocaleString()}</span></div>
              </a>
            )
          })}
        </div>
      )}
      <Link to="/" className="history-back">Back to home</Link>
    </div>
  )
}

export default HistoryPage
