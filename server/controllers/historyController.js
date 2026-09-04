const mongoose = require('mongoose');
const Actor = require('../models/Actor');
const Series = require('../models/Series');
const ActivityHistory = require('../models/ActivityHistory');

const recordHistory = async (req, res) => {
  try {
    const { type, id, action } = req.body;
    if (!['actor', 'series'].includes(type) || !mongoose.isValidObjectId(id) || !['view', 'random'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid history data' });
    }

    const Model = type === 'actor' ? Actor : Series;
    const item = await Model.findById(id).select('_id');
    if (!item) return res.status(404).json({ success: false, message: 'History item not found' });

    const history = await ActivityHistory.create({
      user: req.user._id,
      actor: type === 'actor' ? id : null,
      series: type === 'series' ? id : null,
      action,
    });

    res.status(201).json({ success: true, data: history });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const history = await ActivityHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('actor')
      .populate('series')
      .lean();

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const clearHistory = async (req, res) => {
  try {
    await ActivityHistory.deleteMany({ user: req.user._id });
    res.json({ success: true, message: 'History cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { recordHistory, getHistory, clearHistory };
