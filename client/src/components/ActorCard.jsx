import './ActorCard.css'

function ActorCard({ actor }) {
  const isExternalLink = actor.profileLink?.startsWith('http')

  return (
    <a
      href={actor.profileLink}
      className="actor-card"
      target={isExternalLink ? '_blank' : '_self'}
      rel={isExternalLink ? 'noopener noreferrer' : ''}
    >
      <div className="actor-image-wrapper">
        <img
          src={actor.imageUrl}
          alt={actor.name}
          className="actor-image"
          loading="lazy"
        />
        <div className="actor-overlay">
          <span className="view-profile">
            {isExternalLink ? '🔗 OPEN PROFILE' : 'VIEW PROFILE'}
          </span>
        </div>
      </div>
      <div className="actor-info">
        <h3 className="actor-name">{actor.name}</h3>
        <span className={`actor-tag tag-${actor.tags}`}>
          {actor.tags === 'asian' ? 'ASIAN' : 'EUROPEAN'}
        </span>
      </div>
    </a>
  )
}

export default ActorCard