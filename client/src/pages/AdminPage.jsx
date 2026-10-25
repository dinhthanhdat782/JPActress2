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
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getOnlyFans,
  createOnlyFan,
  updateOnlyFan,
  deleteOnlyFan,
} from '../services/api'
import ActorModal from '../components/ActorModal'
import SeriesModal from '../components/SeriesModal'
import CategoryModal from '../components/CategoryModal'
import OnlyFansModal from '../components/OnlyFansModal'
import AnalyticsPanel from '../components/AnalyticsPanel'
import './AdminPage.css'

function AdminPage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('actors')

  const [actors, setActors] = useState([])
  const [seriesList, setSeriesList] = useState([])
  const [categories, setCategories] = useState([])
  const [onlyFans, setOnlyFans] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [showActorModal, setShowActorModal] = useState(false)
  const [editingActor, setEditingActor] = useState(null)
  const [showSeriesModal, setShowSeriesModal] = useState(false)
  const [editingSeries, setEditingSeries] = useState(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [showOnlyFansModal, setShowOnlyFansModal] = useState(false)
  const [editingOnlyFan, setEditingOnlyFan] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)

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
      const isFirstPage = currentPage === 1
      setLoading(isFirstPage)
      setLoadingMore(!isFirstPage)
      setLoadError('')
      try {
        if (activeTab === 'actors') {
          const data = await getActors(currentPage, 10, tagFilter, debouncedSearch)
          if (isCancelled) return
          const nextRows = data.data || []
          setActors((prev) => (isFirstPage ? nextRows : [...prev, ...nextRows]))
          setTotalPages(data.totalPages || 1)
        } else if (activeTab === 'series') {
          const data = await getSeries(currentPage, 10, tagFilter, debouncedSearch)
          if (isCancelled) return
          const nextRows = data.data || []
          setSeriesList((prev) => (isFirstPage ? nextRows : [...prev, ...nextRows]))
          setTotalPages(data.totalPages || 1)
        } else if (activeTab === 'categories') {
          const data = await getCategories(currentPage, 10, tagFilter, debouncedSearch)
          if (isCancelled) return
          const nextRows = data.data || []
          setCategories((prev) => (isFirstPage ? nextRows : [...prev, ...nextRows]))
          setTotalPages(data.totalPages || 1)
        } else {
          const data = await getOnlyFans(currentPage, 10, tagFilter, debouncedSearch)
          if (isCancelled) return
          const nextRows = data.data || []
          setOnlyFans((prev) => (isFirstPage ? nextRows : [...prev, ...nextRows]))
          setTotalPages(data.totalPages || 1)
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error:', error)
          setLoadError(error.response?.data?.message || 'Failed to load data')
          if (activeTab === 'actors') setActors([])
          if (activeTab === 'series') setSeriesList([])
          if (activeTab === 'categories') setCategories([])
          if (activeTab === 'onlyfans') setOnlyFans([])
          setTotalPages(1)
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
          setLoadingMore(false)
        }
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

  const handleCreateCategory = () => {
    setEditingCategory(null)
    setShowCategoryModal(true)
  }

  const handleCreateOnlyFan = () => {
    setEditingOnlyFan(null)
    setShowOnlyFansModal(true)
  }

  const handleDeleteActor = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteActor(id)
        const data = await getActors(1, 10, tagFilter, debouncedSearch)
        setActors(data.data || [])
        setTotalPages(data.totalPages || 1)
        setCurrentPage(1)
      } catch (error) {
        alert('Error deleting actor')
      }
    }
  }

  const handleDeleteSeries = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete series "${name}"?`)) {
      try {
        await deleteSeries(id)
        const data = await getSeries(1, 10, tagFilter, debouncedSearch)
        setSeriesList(data.data || [])
        setTotalPages(data.totalPages || 1)
        setCurrentPage(1)
      } catch (error) {
        alert('Error deleting series')
      }
    }
  }

  const handleDeleteCategory = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await deleteCategory(id)
        const data = await getCategories(1, 10, tagFilter, debouncedSearch)
        setCategories(data.data || [])
        setTotalPages(data.totalPages || 1)
        setCurrentPage(1)
      } catch {
        alert('Error deleting category')
      }
    }
  }

  const handleDeleteOnlyFan = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete OnlyFans creator "${name}"?`)) {
      try {
        await deleteOnlyFan(id)
        const data = await getOnlyFans(1, 10, tagFilter, debouncedSearch)
        setOnlyFans(data.data || [])
        setTotalPages(data.totalPages || 1)
        setCurrentPage(1)
      } catch {
        alert('Error deleting OnlyFans creator')
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
      const data = await getActors(1, 10, tagFilter, debouncedSearch)
      setActors(data.data || [])
      setTotalPages(data.totalPages || 1)
      setCurrentPage(1)
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
      const data = await getSeries(1, 10, tagFilter, debouncedSearch)
      setSeriesList(data.data || [])
      setTotalPages(data.totalPages || 1)
      setCurrentPage(1)
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving series')
    }
  }

  const handleSaveCategory = async (categoryData) => {
    try {
      if (editingCategory) await updateCategory(editingCategory._id, categoryData)
      else await createCategory(categoryData)
      setShowCategoryModal(false)
      const data = await getCategories(1, 10, tagFilter, debouncedSearch)
      setCategories(data.data || [])
      setTotalPages(data.totalPages || 1)
      setCurrentPage(1)
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving category')
    }
  }

  const handleSaveOnlyFan = async (entry) => {
    try {
      if (editingOnlyFan) await updateOnlyFan(editingOnlyFan._id, entry)
      else await createOnlyFan(entry)
      setShowOnlyFansModal(false)
      const data = await getOnlyFans(1, 10, tagFilter, debouncedSearch)
      setOnlyFans(data.data || [])
      setTotalPages(data.totalPages || 1)
      setCurrentPage(1)
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving OnlyFans creator')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    onLogout()
    navigate('/')
  }

  const isActorsTab = activeTab === 'actors'
  const isSeriesTab = activeTab === 'series'
  const isCategoriesTab = activeTab === 'categories'
  const rows = isActorsTab ? actors : isSeriesTab ? seriesList : isCategoriesTab ? categories : onlyFans
  const hasMore = currentPage < totalPages

  return (
    <div className="admin-page">
      <AnalyticsPanel />
      <div className="admin-header">
        <div>
          <h2>ADMIN DASHBOARD</h2>
          <p>Welcome, <span className="admin-name">{user?.username}</span></p>
        </div>
        <div className="admin-actions">
          {isActorsTab ? (
            <button className="btn-add" onClick={handleCreateActor}>+ ADD ACTOR</button>
          ) : isSeriesTab ? (
            <button className="btn-add" onClick={handleCreateSeries}>+ ADD SERIES</button>
          ) : isCategoriesTab ? (
            <button className="btn-add" onClick={handleCreateCategory}>+ ADD CATEGORY</button>
          ) : (
            <button className="btn-add" onClick={handleCreateOnlyFan}>+ ADD ONLYFANS</button>
          )}
          <button className="btn-logout" onClick={handleLogout}>LOGOUT</button>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${isActorsTab ? 'active' : ''}`} onClick={() => setActiveTab('actors')}>
          Actors
        </button>
        <button className={`admin-tab ${isSeriesTab ? 'active' : ''}`} onClick={() => setActiveTab('series')}>
          Series
        </button>
        <button className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
          Categories
        </button>
        <button className={`admin-tab ${activeTab === 'onlyfans' ? 'active' : ''}`} onClick={() => setActiveTab('onlyfans')}>
          OnlyFans
        </button>
      </div>

      <div className="admin-filters">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={isActorsTab ? 'Search by actress name...' : isSeriesTab ? 'Search by series name...' : isCategoriesTab ? 'Search by category name...' : 'Search OnlyFans creators...'}
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
                <th>{isActorsTab ? 'NAME' : isSeriesTab ? 'SERIES NAME' : isCategoriesTab ? 'CATEGORY NAME' : 'ONLYFANS NAME'}</th>
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
                  <td className="table-name" title={item.name}>{item.name}</td>
                  <td>
                    <span className={`table-tag tag-${item.tags}`}>
                      {item.tags.toUpperCase()}
                    </span>
                  </td>
                  <td className="table-link" title={item.profileLink}>
                    {item.profileLink}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-edit"
                        onClick={() => {
                          if (isActorsTab) {
                            setEditingActor(item)
                            setShowActorModal(true)
                          } else if (isSeriesTab) {
                            setEditingSeries(item)
                            setShowSeriesModal(true)
                          } else if (isCategoriesTab) {
                            setEditingCategory(item)
                            setShowCategoryModal(true)
                          } else {
                            setEditingOnlyFan(item)
                            setShowOnlyFansModal(true)
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
                            : isSeriesTab
                              ? handleDeleteSeries(item._id, item.name)
                              : isCategoriesTab
                                ? handleDeleteCategory(item._id, item.name)
                                : handleDeleteOnlyFan(item._id, item.name)
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
                    No {isActorsTab ? 'actors' : isSeriesTab ? 'series' : isCategoriesTab ? 'categories' : 'OnlyFans creators'} found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {hasMore && (
        <div className="admin-pagination">
          <button
            className="btn-load-more"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading...' : 'Load more'}
          </button>
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
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onSave={handleSaveCategory}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
      {showOnlyFansModal && (
        <OnlyFansModal
          entry={editingOnlyFan}
          onSave={handleSaveOnlyFan}
          onClose={() => setShowOnlyFansModal(false)}
        />
      )}
    </div>
  )
}

export default AdminPage
