const express = require('express');
const { protect } = require('../middleware/auth');
const { recordHistory, getHistory, clearHistory } = require('../controllers/historyController');

const router = express.Router();

router.use(protect);
router.get('/', getHistory);
router.post('/', recordHistory);
router.delete('/', clearHistory);

module.exports = router;
