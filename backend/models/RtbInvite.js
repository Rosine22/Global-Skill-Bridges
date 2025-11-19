const mongoose = require('mongoose');

const rtbInviteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  tokenHash: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.models.RtbInvite || mongoose.model('RtbInvite', rtbInviteSchema);
