const mongoose = require('mongoose');

const actorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Actor name is required'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
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

module.exports = mongoose.model('Actor', actorSchema);