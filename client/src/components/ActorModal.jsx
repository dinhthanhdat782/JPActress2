import { useState, useRef } from 'react'
import { uploadImage } from '../services/api'
import './ActorModal.css'

function ActorModal({ actor, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: actor?.name || '',
    imageUrl: actor?.imageUrl || '',
    profileLink: actor?.profileLink || '',
    tags: actor?.tags || 'asian',
  })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const data = await uploadImage(file)
      setFormData({ ...formData, imageUrl: data.data.imageUrl })
    } catch (error) {
      alert('Upload failed: ' + (error.response?.data?.message || error.message))
    }
    setUploading(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{actor ? 'EDIT ACTOR' : 'ADD NEW ACTOR'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>NAME</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Actor name"
              required
            />
          </div>

          <div className="form-group">
            <label>IMAGE</label>
            <div className="image-input-group">
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="Paste URL or upload file below"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn-upload"
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
              >
                {uploading ? 'UPLOADING...' : '📁 UPLOAD FROM COMPUTER'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>PROFILE LINK</label>
            <input
              type="url"
              name="profileLink"
              value={formData.profileLink}
              onChange={handleChange}
              placeholder="https://instagram.com/actor-name"
              required
            />
            <span className="form-hint">External link (Instagram, Twitter, IMDB, etc.)</span>
          </div>

          <div className="form-group">
            <label>TAGS</label>
            <select name="tags" value={formData.tags} onChange={handleChange}>
              <option value="asian">Asian</option>
              <option value="european">European</option>
            </select>
          </div>

          {formData.imageUrl && (
            <div className="image-preview">
              <label>PREVIEW</label>
              <img src={formData.imageUrl} alt="Preview" />
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              CANCEL
            </button>
            <button type="submit" className="btn-save" disabled={uploading}>
              {actor ? 'UPDATE' : 'CREATE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ActorModal