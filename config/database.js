const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
  const primary = process.env.MONGO_URL;
  const fallback = process.env.MONGO_FALLBACK || "mongodb://127.0.0.1:27017/learnsphere";

  mongoose
    .connect(primary)
    .then(() => {
      console.log("DB connected successfully (primary)...");
    })
    .catch(async (err) => {
      console.log("Primary DB connection failed:", err.message || err);
      // If auth failure or primary down, try fallback
      try {
        await mongoose.connect(fallback);
        console.log("DB connected successfully (fallback)...");
      } catch (fallbackErr) {
        console.log("Fallback DB connection failed:", fallbackErr.message || fallbackErr);
        // Don't exit; keep server running but warn
        console.log("Database not connected. Some functionality may be disabled.");
      }
    });
};
