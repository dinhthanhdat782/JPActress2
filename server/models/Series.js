const mongoose = require('mongoose');

const seriesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Series name is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    imagePublicId: {
      type: String,
      default: null,
    },
    profileLink: {
      type: String,
      required: [true, 'Profile link is required'],
    },
    tags: {
      type: String,
      enum: ['asian', 'european'],
      required: [true, 'Tags is required'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Series', seriesSchema);
