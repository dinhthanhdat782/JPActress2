const mongoose = require('mongoose');

const activityHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Actor',
      default: null,
    },
    series: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Series',
      default: null,
    },
    action: {
      type: String,
      enum: ['view', 'random'],
      required: true,
    },
  },
  { timestamps: true }
);

activityHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityHistory', activityHistorySchema);
