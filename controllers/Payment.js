require("dotenv").config();

// Payment functionality disabled - provide placeholder responses so routes remain available
exports.capturePayment = async (req, res) => {
  return res.status(503).json({
    success: false,
    message: "Payment functionality is disabled on this server.",
  });
};

exports.verifyPayment = async (req, res) => {
  return res.status(503).json({
    success: false,
    message: "Payment functionality is disabled on this server.",
  });
};

exports.sendPaymentSuccessEmail = async (req, res) => {
  return res.status(503).json({
    success: false,
    message: "Email/payment notifications are disabled on this server.",
  });
};

