import './LoadingGrid.css'

function LoadingGrid({ count = 12, label = 'Loading content...' }) {
  return (
    <div className="loading-grid" aria-label={label} role="status">
      {Array.from({ length: count }, (_, index) => (
        <div className="skeleton-card" key={index} aria-hidden="true">
          <div className="skeleton-image" />
          <div className="skeleton-footer">
            <div className="skeleton-line skeleton-line-short" />
            <div className="skeleton-line skeleton-line-tag" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default LoadingGrid
