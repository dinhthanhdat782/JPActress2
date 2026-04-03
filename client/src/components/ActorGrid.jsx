import ActorCard from './ActorCard'
import './ActorGrid.css'

function ActorGrid({ actors, loading }) {
  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading talent...</p>
      </div>
    )
  }

  if (actors.length === 0) {
    return (
      <div className="no-results">
        <p>No actors found</p>
      </div>
    )
  }

  return (
    <div className="actor-grid">
      {actors.map((actor) => (
        <ActorCard key={actor._id} actor={actor} />
      ))}
    </div>
  )
}

export default ActorGrid