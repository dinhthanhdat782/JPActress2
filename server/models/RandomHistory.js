const mongoose = require('mongoose');

const randomHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    histories: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    activeTag: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RandomHistory', randomHistorySchema);
