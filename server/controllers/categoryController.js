const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary');
const { extractPublicIdFromUrl } = require('../utils/cloudinary');

const getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.tags) filter.tags = req.query.tags;
    if (req.query.q) filter.name = { $regex: req.query.q.trim(), $options: 'i' };

    const total = await Category.countDocuments(filter);
    const categories = await Category.find(filter).sort({ name: 1 }).skip(skip).limit(limit);

    res.json({
      success: true,
      count: categories.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, imageUrl, imagePublicId, profileLink, tags } = req.body;
    const category = await Category.create({ name, imageUrl, imagePublicId, profileLink, tags });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const publicId = category.imagePublicId || extractPublicIdFromUrl(category.imageUrl);
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

    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
