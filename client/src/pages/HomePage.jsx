import { useState, useEffect } from 'react'
import SearchBar from '../components/SearchBar'
import FilterTabs from '../components/FilterTabs'
import ActorGrid from '../components/ActorGrid'
import Pagination from '../components/Pagination'
import { getActors } from '../services/api'
import './HomePage.css'

function HomePage() {
  const [actors, setActors] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeFilter, setActiveFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchActors = async () => {
    setLoading(true)
    try {
      const data = await getActors(currentPage, 12, activeFilter)
      let filteredActors = data.data

      // Client-side search filter
      if (searchQuery) {
        filteredActors = filteredActors.filter((actor) =>
          actor.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      setActors(filteredActors)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error fetching actors:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchActors()
  }, [currentPage, activeFilter])

  useEffect(() => {
    // Re-filter when search changes
    fetchActors()
  }, [searchQuery])

  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    setCurrentPage(1)
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  return (
    <div className="home-page">
      <div className="page-header">
        <h2 className="page-title">OUR TALENT</h2>
        <p className="page-subtitle">
          Discover exceptional actors from across Asia and Europe
        </p>
      </div>

      <SearchBar onSearch={handleSearch} />
      <FilterTabs activeFilter={activeFilter} onFilterChange={handleFilterChange} />
      <ActorGrid actors={actors} loading={loading} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}

export default HomePage