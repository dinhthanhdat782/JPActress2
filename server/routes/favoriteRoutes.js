const express = require('express');
const { protect } = require('../middleware/auth');
const { getFavorites, toggleFavorite } = require('../controllers/favoriteController');

const router = express.Router();

router.use(protect);
router.get('/', getFavorites);
router.post('/toggle', toggleFavorite);

module.exports = router;
