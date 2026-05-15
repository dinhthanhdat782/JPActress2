const express = require('express');
const router = express.Router();
const { Readable } = require('stream');
const { upload, cloudinary } = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/auth');

// @route   POST /api/upload
// @desc    Upload ảnh
// @access  Admin only
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const uploadResult = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'jpactress',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    Readable.from(req.file.buffer).pipe(uploadStream);
  });

  res.json({
    success: true,
    data: {
      imageUrl: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,
    },
  });
});

module.exports = router;
