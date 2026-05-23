import './ActorCard.css'
import { getOptimizedImageSrcSet, getOptimizedImageUrl } from '../utils/image'

function ActorCard({ actor }) {
  const isExternalLink = actor.profileLink?.startsWith('http')
  const imageSrc = getOptimizedImageUrl(actor.imageUrl, 520)
  const imageSrcSet = getOptimizedImageSrcSet(actor.imageUrl, 260)

  return (
    <a
      href={actor.profileLink}
      className="actor-card"
      target={isExternalLink ? '_blank' : '_self'}
      rel={isExternalLink ? 'noopener noreferrer' : ''}
    >
      <div className="actor-image-wrapper">
        <img
          src={imageSrc}
          srcSet={imageSrcSet}
          sizes="(max-width: 768px) 50vw, 260px"
          alt={actor.name}
          className="actor-image"
          loading="lazy"
        />
          <div className="actor-overlay">
            <div className="actor-caption">
              <span className="actor-card-name">{actor.name}</span>
            </div>
            <span className="view-profile">
              {isExternalLink ? '🔗 OPEN PROFILE' : 'VIEW PROFILE'}
            </span>
          </div>
      </div>
        <div className="actor-info">
          <span className={`actor-tag tag-${actor.tags}`}>
            {actor.tags === 'asian' ? 'ASIAN' : 'EUROPEAN'}
          </span>
        </div>
    </a>
  )
}

export default ActorCard
