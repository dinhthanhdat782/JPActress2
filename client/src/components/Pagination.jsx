import './Pagination.css'

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  return (
    <div className="pagination">
      <button
        className="page-btn prev"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ← PREVIOUS
      </button>

      <div className="page-numbers">
        {pages.map((page) => (
          <button
            key={page}
            className={`page-btn number ${currentPage === page ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        className="page-btn next"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        NEXT →
      </button>
    </div>
  )
}

export default Pagination