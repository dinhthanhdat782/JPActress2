const OnlyFan = require('../models/OnlyFan');
const cloudinary = require('../config/cloudinary');
const { extractPublicIdFromUrl } = require('../utils/cloudinary');

const getOnlyFans = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = {};
    if (req.query.tags) filter.tags = req.query.tags;
    if (req.query.q) filter.name = { $regex: req.query.q.trim(), $options: 'i' };
    const total = await OnlyFan.countDocuments(filter);
    const onlyFans = await OnlyFan.find(filter).sort({ name: 1 }).skip((page - 1) * limit).limit(limit);

    res.json({ success: true, count: onlyFans.length, totalPages: Math.ceil(total / limit), currentPage: page, data: onlyFans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createOnlyFan = async (req, res) => {
  try {
    const { name, imageUrl, imagePublicId, profileLink, tags } = req.body;
    const onlyFan = await OnlyFan.create({ name, imageUrl, imagePublicId, profileLink, tags });
    res.status(201).json({ success: true, data: onlyFan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateOnlyFan = async (req, res) => {
  try {
    const onlyFan = await OnlyFan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!onlyFan) return res.status(404).json({ success: false, message: 'OnlyFans entry not found' });
    res.json({ success: true, data: onlyFan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteOnlyFan = async (req, res) => {
  try {
    const onlyFan = await OnlyFan.findById(req.params.id);
    if (!onlyFan) return res.status(404).json({ success: false, message: 'OnlyFans entry not found' });
    const publicId = onlyFan.imagePublicId || extractPublicIdFromUrl(onlyFan.imageUrl);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      } catch (error) {
        return res.status(500).json({ success: false, message: `Failed to delete image on Cloudinary: ${error.message}` });
      }
    }
    await onlyFan.deleteOne();
    res.json({ success: true, message: 'OnlyFans entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getOnlyFans, createOnlyFan, updateOnlyFan, deleteOnlyFan };
