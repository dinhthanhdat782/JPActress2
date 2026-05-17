import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getActors,
  createActor,
  updateActor,
  deleteActor,
  getSeries,
  createSeries,
  updateSeries,
  deleteSeries,
} from '../services/api'
import ActorModal from '../components/ActorModal'
import SeriesModal from '../components/SeriesModal'
import './AdminPage.css'

function AdminPage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('actors')

  const [actors, setActors] = useState([])
  const [seriesList, setSeriesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [showActorModal, setShowActorModal] = useState(false)
  const [editingActor, setEditingActor] = useState(null)
  const [showSeriesModal, setShowSeriesModal] = useState(false)
  const [editingSeries, setEditingSeries] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const navigate = useNavigate()

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim())
    }, 250)
    return () => clearTimeout(timeout)
  }, [searchTerm])

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    let isCancelled = false

    const loadData = async () => {
      setLoading(true)
      setLoadError('')
      try {
        if (activeTab === 'actors') {
          const data = await getActors(currentPage, 10, tagFilter, debouncedSearch)
          if (isCancelled) return
          setActors(data.data || [])
          setTotalPages(data.totalPages || 1)
        } else {
          const data = await getSeries(currentPage, 10, tagFilter, debouncedSearch)
          if (isCancelled) return
          setSeriesList(data.data || [])
          setTotalPages(data.totalPages || 1)
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error:', error)
          setLoadError(error.response?.data?.message || 'Failed to load data')
          if (activeTab === 'actors') setActors([])
          if (activeTab === 'series') setSeriesList([])
          setTotalPages(1)
        }
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    loadData()

    return () => {
      isCancelled = true
    }
  }, [user, currentPage, debouncedSearch, tagFilter, activeTab, navigate])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, tagFilter, activeTab])

  const handleCreateActor = () => {
    setEditingActor(null)
    setShowActorModal(true)
  }

  const handleCreateSeries = () => {
    setEditingSeries(null)
    setShowSeriesModal(true)
  }

  const handleDeleteActor = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteActor(id)
        const data = await getActors(currentPage, 10, tagFilter, debouncedSearch)
        setActors(data.data || [])
        setTotalPages(data.totalPages || 1)
      } catch (error) {
        alert('Error deleting actor')
      }
    }
  }

  const handleDeleteSeries = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete series "${name}"?`)) {
      try {
        await deleteSeries(id)
        const data = await getSeries(currentPage, 10, tagFilter, debouncedSearch)
        setSeriesList(data.data || [])
        setTotalPages(data.totalPages || 1)
      } catch (error) {
        alert('Error deleting series')
      }
    }
  }

  const handleSaveActor = async (actorData) => {
    try {
      if (editingActor) {
        await updateActor(editingActor._id, actorData)
      } else {
        await createActor(actorData)
      }
      setShowActorModal(false)
      const data = await getActors(currentPage, 10, tagFilter, debouncedSearch)
      setActors(data.data || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving actor')
    }
  }

  const handleSaveSeries = async (seriesData) => {
    try {
      if (editingSeries) {
        await updateSeries(editingSeries._id, seriesData)
      } else {
        await createSeries(seriesData)
      }
      setShowSeriesModal(false)
      const data = await getSeries(currentPage, 10, tagFilter, debouncedSearch)
      setSeriesList(data.data || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving series')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    onLogout()
    navigate('/')
  }

  const isActorsTab = activeTab === 'actors'
  const rows = isActorsTab ? actors : seriesList

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h2>ADMIN DASHBOARD</h2>
          <p>Welcome, <span className="admin-name">{user?.username}</span></p>
        </div>
        <div className="admin-actions">
          {isActorsTab ? (
            <button className="btn-add" onClick={handleCreateActor}>+ ADD ACTOR</button>
          ) : (
            <button className="btn-add" onClick={handleCreateSeries}>+ ADD SERIES</button>
          )}
          <button className="btn-logout" onClick={handleLogout}>LOGOUT</button>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${isActorsTab ? 'active' : ''}`} onClick={() => setActiveTab('actors')}>
          Actors
        </button>
        <button className={`admin-tab ${!isActorsTab ? 'active' : ''}`} onClick={() => setActiveTab('series')}>
          Series
        </button>
      </div>

      <div className="admin-filters">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={isActorsTab ? 'Search by actress name...' : 'Search by series name...'}
        />
        <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
          <option value="">All tags</option>
          <option value="asian">Asian</option>
          <option value="european">European</option>
        </select>
        <button
          className="btn-clear-filter"
          onClick={() => {
            setSearchTerm('')
            setTagFilter('')
          }}
        >
          Clear
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">Loading...</div>
      ) : loadError ? (
        <div className="admin-loading">{loadError}</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>IMAGE</th>
                <th>{isActorsTab ? 'NAME' : 'SERIES NAME'}</th>
                <th>TAGS</th>
                <th>PROFILE LINK</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item._id}>
                  <td>
                    <img src={item.imageUrl} alt={item.name} className="table-img" />
                  </td>
                  <td className="table-name">{item.name}</td>
                  <td>
                    <span className={`table-tag tag-${item.tags}`}>
                      {item.tags.toUpperCase()}
                    </span>
                  </td>
                  <td className="table-link">{item.profileLink}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-edit"
                        onClick={() => {
                          if (isActorsTab) {
                            setEditingActor(item)
                            setShowActorModal(true)
                          } else {
                            setEditingSeries(item)
                            setShowSeriesModal(true)
                          }
                        }}
                      >
                        EDIT
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() =>
                          isActorsTab
                            ? handleDeleteActor(item._id, item.name)
                            : handleDeleteSeries(item._id, item.name)
                        }
                      >
                        DELETE
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="5" className="table-empty">
                    No {isActorsTab ? 'actors' : 'series'} found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="admin-pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {showActorModal && (
        <ActorModal
          actor={editingActor}
          onSave={handleSaveActor}
          onClose={() => setShowActorModal(false)}
        />
      )}

      {showSeriesModal && (
        <SeriesModal
          series={editingSeries}
          onSave={handleSaveSeries}
          onClose={() => setShowSeriesModal(false)}
        />
      )}
    </div>
  )
}

export default AdminPage
