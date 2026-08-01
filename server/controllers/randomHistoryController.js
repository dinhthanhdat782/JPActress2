const RandomHistory = require('../models/RandomHistory');

const getRandomHistory = async (req, res) => {
  try {
    const history = await RandomHistory.findOne({ user: req.user._id }).lean();
    res.json({
      success: true,
      data: history || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const saveRandomHistory = async (req, res) => {
  try {
    const { activeTag = '', histories = {} } = req.body;
    const history = await RandomHistory.findOneAndUpdate(
      { user: req.user._id },
      { user: req.user._id, activeTag, histories },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getRandomHistory, saveRandomHistory };
