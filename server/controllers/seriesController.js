const Series = require('../models/Series');
const cloudinary = require('../config/cloudinary');
const { extractPublicIdFromUrl } = require('../utils/cloudinary');

// @desc    Get all series (with pagination + filters)
// @route   GET /api/series?tags=asian&q=ipx&page=1&limit=10
const getSeries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.tags) filter.tags = req.query.tags;
    if (req.query.q) filter.name = { $regex: req.query.q.trim(), $options: 'i' };

    const total = await Series.countDocuments(filter);
    const series = await Series.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: series.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: series,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create series
// @route   POST /api/series
const createSeries = async (req, res) => {
  try {
    const { name, imageUrl, imagePublicId, profileLink, tags } = req.body;
    const series = await Series.create({ name, imageUrl, imagePublicId, profileLink, tags });
    res.status(201).json({ success: true, data: series });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update series
// @route   PUT /api/series/:id
const updateSeries = async (req, res) => {
  try {
    const series = await Series.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!series) {
      return res.status(404).json({ success: false, message: 'Series not found' });
    }
    res.json({ success: true, data: series });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete series
// @route   DELETE /api/series/:id
const deleteSeries = async (req, res) => {
  try {
    const series = await Series.findById(req.params.id);
    if (!series) {
      return res.status(404).json({ success: false, message: 'Series not found' });
    }

    const publicId = series.imagePublicId || extractPublicIdFromUrl(series.imageUrl);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: `Failed to delete image on Cloudinary: ${error.message}`,
        });
      }
    }

    await series.deleteOne();

    res.json({ success: true, message: 'Series deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSeries, createSeries, updateSeries, deleteSeries };
