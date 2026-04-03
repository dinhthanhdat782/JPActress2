const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/auth');

// @route   POST /api/upload
// @desc    Upload ảnh
// @access  Admin only
router.post('/', protect, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  res.json({
    success: true,
    data: { imageUrl },
  });
});

module.exports = router;