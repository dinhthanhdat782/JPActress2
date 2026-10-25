const express = require('express');
const router = express.Router();
const { getOnlyFans, createOnlyFan, updateOnlyFan, deleteOnlyFan } = require('../controllers/onlyFansController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/').get(getOnlyFans).post(protect, adminOnly, createOnlyFan);
router.route('/:id').put(protect, adminOnly, updateOnlyFan).delete(protect, adminOnly, deleteOnlyFan);

module.exports = router;
