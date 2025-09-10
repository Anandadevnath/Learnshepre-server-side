const mongoose = require("mongoose");
// Mail sending disabled. OTP model kept for compatibility but no emails will be sent.

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 5 * 60,
  },
});

// No-op: we intentionally do not send verification emails from the model.
// If you want to re-enable, implement sending logic in a controller or service and keep secrets out of the model.

module.exports = mongoose.model("OTP", otpSchema);
