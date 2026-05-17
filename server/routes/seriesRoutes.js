const express = require('express');
const router = express.Router();
const {
  getSeries,
  createSeries,
  updateSeries,
  deleteSeries,
} = require('../controllers/seriesController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/').get(getSeries).post(protect, adminOnly, createSeries);
router.route('/:id').put(protect, adminOnly, updateSeries).delete(protect, adminOnly, deleteSeries);

module.exports = router;
