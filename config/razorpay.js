const Razorpay = require("razorpay");
require("dotenv").config();

// Initialize Razorpay only when keys are present. If keys are missing, export null and log a warning.
let instance = null;
if (process.env.RAZORPAY_KEY && process.env.RAZORPAY_SECRET) {
  try {
    instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET,
    });
    console.log("Razorpay initialized.");
  } catch (err) {
    console.log("Razorpay initialization failed:", err.message || err);
    instance = null;
  }
} else {
  console.log("Razorpay keys not provided. Payment functionality is disabled.");
}

exports.instance = instance;
