const express = require('express');
const router = express.Router();
const { getRandomHistory, saveRandomHistory } = require('../controllers/randomHistoryController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.route('/').get(getRandomHistory).put(saveRandomHistory);

module.exports = router;
