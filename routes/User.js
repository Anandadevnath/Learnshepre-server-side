const express = require("express");
const router = express.Router();

// Auth controllers
const {
  // sendOtp removed
  signUp,
  login,
  changePassword,
  devAutoSignupLogin,
} = require("../controllers/Auth");

// Reset Password Controllers:
const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/ResetPassword");

// Auth middleware
const { auth } = require("../middlewares/auth");

// OTP Limiter:
// otpLimiter removed

// Reset Password Limiter:
const {
  resetPasswordRequestLimiter,
} = require("../middlewares/reset-password-rate-limit");

// Authentcation routes:

router.post("/login", login);
router.post("/signup", signUp);
// Dev-only endpoint: POST /api/v1/auth/dev-auth
router.post("/dev-auth", devAutoSignupLogin);
// OTP route removed
router.post("/changepassword", auth, changePassword);

// Reset password routes:
router.post(
  "/reset-password-token",
  resetPasswordRequestLimiter,
  resetPasswordToken
);
router.post("/reset-password", resetPassword);

module.exports = router;
