const mongoose = require('mongoose');

const onlyFanSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'OnlyFans name is required'], trim: true },
    imageUrl: { type: String, required: [true, 'Image URL is required'] },
    imagePublicId: { type: String, default: null },
    profileLink: { type: String, required: [true, 'Profile link is required'] },
    tags: { type: String, enum: ['asian', 'european'], required: [true, 'Tags is required'] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OnlyFan', onlyFanSchema);
