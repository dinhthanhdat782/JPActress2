const express = require('express');
const router = express.Router();
const {
  getActors,
  getActor,
  createActor,
  updateActor,
  deleteActor,
  getRandomActor,
} = require('../controllers/actorController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.route('/random').get(getRandomActor);
router.route('/').get(getActors);
router.route('/:id').get(getActor);

// Admin only routes
router.route('/').post(protect, adminOnly, createActor);
router.route('/:id').put(protect, adminOnly, updateActor).delete(protect, adminOnly, deleteActor);

module.exports = router;