import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getActors, createActor, updateActor, deleteActor } from '../services/api'
import ActorModal from '../components/ActorModal'
import './AdminPage.css'

function AdminPage({ user, onLogout }) {
  const [actors, setActors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingActor, setEditingActor] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchActors()
  }, [user, currentPage])

  const fetchActors = async () => {
    setLoading(true)
    try {
      const data = await getActors(currentPage, 10)
      setActors(data.data)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  const handleCreate = () => {
    setEditingActor(null)
    setShowModal(true)
  }

  const handleEdit = (actor) => {
    setEditingActor(actor)
    setShowModal(true)
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteActor(id)
        fetchActors()
      } catch (error) {
        alert('Error deleting actor')
      }
    }
  }

  const handleSave = async (actorData) => {
    try {
      if (editingActor) {
        await updateActor(editingActor._id, actorData)
      } else {
        await createActor(actorData)
      }
      setShowModal(false)
      fetchActors()
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving actor')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    onLogout()
    navigate('/')
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h2>ADMIN DASHBOARD</h2>
          <p>Welcome, <span className="admin-name">{user?.username}</span></p>
        </div>
        <div className="admin-actions">
          <button className="btn-add" onClick={handleCreate}>
            + ADD ACTOR
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            LOGOUT
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">Loading...</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>IMAGE</th>
                <th>NAME</th>
                <th>TAGS</th>
                <th>PROFILE LINK</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {actors.map((actor) => (
                <tr key={actor._id}>
                  <td>
                    <img src={actor.imageUrl} alt={actor.name} className="table-img" />
                  </td>
                  <td className="table-name">{actor.name}</td>
                  <td>
                    <span className={`table-tag tag-${actor.tags}`}>
                      {actor.tags.toUpperCase()}
                    </span>
                  </td>
                  <td className="table-link">{actor.profileLink}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-edit" onClick={() => handleEdit(actor)}>
                        EDIT
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(actor._id, actor.name)}>
                        DELETE
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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

      {showModal && (
        <ActorModal
          actor={editingActor}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

export default AdminPage