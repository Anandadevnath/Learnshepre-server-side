const express = require("express");
const router = express.Router();

// Payments disabled - return 503 for all payment endpoints
router.post("/capturePayment", (req, res) => {
    return res.status(503).json({ success: false, message: "Payments are disabled on this server." });
});
router.post("/verifyPayment", (req, res) => {
    return res.status(503).json({ success: false, message: "Payments are disabled on this server." });
});
router.post("/sendPaymentSuccessEmail", (req, res) => {
    return res.status(503).json({ success: false, message: "Payments are disabled on this server." });
});

module.exports = router;
