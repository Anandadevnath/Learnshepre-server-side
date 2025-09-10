const cloudinary = require("cloudinary").v2;
require("dotenv").config();

exports.cloudinaryConnect = () => {
  try {
    // Trim env vars to avoid accidental spaces and provide a small diagnostic
    const cloudName = process.env.CLOUD_NAME ? process.env.CLOUD_NAME.trim() : undefined;
    const apiKey = process.env.API_KEY ? process.env.API_KEY.trim() : undefined;
    const apiSecret = process.env.API_SECRET ? process.env.API_SECRET.trim() : undefined;

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn("Cloudinary credentials missing or incomplete. Check CLOUD_NAME/API_KEY/API_SECRET in .env");
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    console.log("Cloudinary set up. cloud_name:", cloudName ? cloudName : "<not set>");
  } catch (error) {
    console.log("Cloudinary Connection Error: ", error);
  }
};
