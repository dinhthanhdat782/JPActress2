import { useEffect, useState } from 'react'
import { getAdminAnalytics } from '../services/api'
import './AnalyticsPanel.css'

const emptyData = { totals: {}, dailyActivity: [], topActors: [] }

function AnalyticsPanel() {
  const [data, setData] = useState(emptyData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    getAdminAnalytics()
      .then((response) => {
        if (!cancelled) setData(response.data || emptyData)
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load analytics')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  if (loading) return <section className="analytics-panel analytics-loading">Loading analytics...</section>
  if (error) return <section className="analytics-panel analytics-loading">{error}</section>

  const totals = data.totals || {}
  const daily = data.dailyActivity || []
  const maxDaily = Math.max(...daily.map((item) => item.count), 1)

  return (
    <section className="analytics-panel">
      <div className="analytics-heading">
        <div><h3>Analytics</h3><p>Directory activity overview</p></div>
        <span>Last 7 days</span>
      </div>
      <div className="analytics-metrics">
        {[
          ['Actors', totals.actors], ['Series', totals.series], ['Views', totals.views],
          ['Random picks', totals.randomPicks], ['Favorites', totals.favorites], ['Users', totals.users],
        ].map(([label, value]) => <div className="analytics-metric" key={label}><strong>{value || 0}</strong><span>{label}</span></div>)}
      </div>
      <div className="analytics-lower">
        <div className="analytics-chart">
          <h4>Recent activity</h4>
          {daily.length ? daily.map((item) => (
            <div className="activity-bar-row" key={`${item._id.day}-${item._id.action}`}>
              <span>{item._id.day.slice(5)}</span>
              <div className="activity-bar-track"><div className={`activity-bar action-${item._id.action}`} style={{ width: `${(item.count / maxDaily) * 100}%` }} /></div>
              <strong>{item.count}</strong>
            </div>
          )) : <p className="analytics-muted">No activity recorded yet.</p>}
        </div>
        <div className="analytics-top">
          <h4>Most viewed actors</h4>
          {data.topActors.length ? data.topActors.map((actor) => (
            <div className="top-actor" key={actor._id}><img src={actor.imageUrl} alt="" /><span>{actor.name}</span><strong>{actor.views}</strong></div>
          )) : <p className="analytics-muted">No views recorded yet.</p>}
        </div>
      </div>
      <div className="analytics-recent">Added in last 7 days: <strong>{totals.recentActors || 0}</strong> actors and <strong>{totals.recentSeries || 0}</strong> series</div>
    </section>
  )
}

export default AnalyticsPanel
