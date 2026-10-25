import { useRef, useState } from 'react'
import { uploadImage } from '../services/api'
import './ActorModal.css'

function OnlyFansModal({ entry, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: entry?.name || '',
    imageUrl: entry?.imageUrl || '',
    profileLink: entry?.profileLink || '',
    tags: entry?.tags || 'asian',
  })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const response = await uploadImage(file)
      setFormData((previous) => ({ ...previous, imageUrl: response.data.imageUrl }))
    } catch (error) {
      alert('Upload failed: ' + (error.response?.data?.message || error.message))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>{entry ? 'EDIT ONLYFANS' : 'ADD ONLYFANS'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={(event) => { event.preventDefault(); onSave(formData) }} className="modal-form">
          <div className="form-group">
            <label>NAME</label>
            <input type="text" name="name" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} required />
          </div>
          <div className="form-group">
            <label>IMAGE</label>
            <div className="image-input-group">
              <input type="text" name="imageUrl" value={formData.imageUrl} onChange={(event) => setFormData({ ...formData, imageUrl: event.target.value })} placeholder="Paste URL or upload file below" required />
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" style={{ display: 'none' }} />
              <button type="button" className="btn-upload" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                {uploading ? 'UPLOADING...' : '📁 UPLOAD FROM COMPUTER'}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>PROFILE LINK</label>
            <input type="url" name="profileLink" value={formData.profileLink} onChange={(event) => setFormData({ ...formData, profileLink: event.target.value })} placeholder="https://..." required />
          </div>
          <div className="form-group">
            <label>TAGS</label>
            <select name="tags" value={formData.tags} onChange={(event) => setFormData({ ...formData, tags: event.target.value })}>
              <option value="asian">Asian</option>
              <option value="european">European</option>
            </select>
          </div>
          {formData.imageUrl && <div className="image-preview"><label>PREVIEW</label><img src={formData.imageUrl} alt="Preview" /></div>}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>CANCEL</button>
            <button type="submit" className="btn-save" disabled={uploading}>{entry ? 'UPDATE' : 'CREATE'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OnlyFansModal
