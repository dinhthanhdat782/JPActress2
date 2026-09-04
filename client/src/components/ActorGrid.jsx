import ActorCard from './ActorCard'
import LoadingGrid from './LoadingGrid'
import './ActorGrid.css'

function ActorGrid({ actors, loading }) {
  if (loading) {
    return <LoadingGrid count={12} label="Loading talent..." />
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
