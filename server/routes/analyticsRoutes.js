const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const { getAdminAnalytics } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/', protect, adminOnly, getAdminAnalytics);

module.exports = router;
