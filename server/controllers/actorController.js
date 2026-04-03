const Actor = require('../models/Actor');

// @desc    Get all actors (with pagination + filter by tags)
// @route   GET /api/actors?tags=asian&page=1&limit=12
const getActors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Filter by tags if provided
    const filter = {};
    if (req.query.tags) {
      filter.tags = req.query.tags;
    }

    const total = await Actor.countDocuments(filter);
    const actors = await Actor.find(filter).skip(skip).limit(limit);

    res.json({
      success: true,
      count: actors.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: actors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single actor
// @route   GET /api/actors/:id
const getActor = async (req, res) => {
  try {
    const actor = await Actor.findById(req.params.id);
    if (!actor) {
      return res.status(404).json({ success: false, message: 'Actor not found' });
    }
    res.json({ success: true, data: actor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create actor
// @route   POST /api/actors
const createActor = async (req, res) => {
  try {
    const { name, imageUrl, profileLink, tags } = req.body;
    const actor = await Actor.create({ name, imageUrl, profileLink, tags });
    res.status(201).json({ success: true, data: actor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update actor
// @route   PUT /api/actors/:id
const updateActor = async (req, res) => {
  try {
    const actor = await Actor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!actor) {
      return res.status(404).json({ success: false, message: 'Actor not found' });
    }
    res.json({ success: true, data: actor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete actor
// @route   DELETE /api/actors/:id
const deleteActor = async (req, res) => {
  try {
    const actor = await Actor.findByIdAndDelete(req.params.id);
    if (!actor) {
      return res.status(404).json({ success: false, message: 'Actor not found' });
    }
    res.json({ success: true, message: 'Actor deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Random actor
// @route   GET /api/actors/random
const getRandomActor = async (req, res) => {
  try {
    const { tags, exclude } = req.query;
    const filter = {};

    if (tags) filter.tags = tags;

    // Exclude actors that have been randomly selected before
    if (exclude) {
      const excludeIds = exclude.split(',');
      filter._id = { $nin: excludeIds };
    }

    const count = await Actor.countDocuments(filter);

    if (count === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'No more actors available',
        remaining: 0,
      });
    }

    const random = Math.floor(Math.random() * count);
    const actor = await Actor.findOne(filter).skip(random);

    res.json({
      success: true,
      data: actor,
      remaining: count - 1,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = { getActors, getActor, createActor, updateActor, deleteActor, getRandomActor };