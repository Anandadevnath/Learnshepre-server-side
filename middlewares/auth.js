const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// auth
exports.auth = async (req, res, next) => {
  try {
    const authHeader = req.headers && (req.headers.authorization || req.header && req.header("authorization"));
    const token = req.cookies?.token || req.body?.token || (authHeader ? authHeader.replace(/^[Bb]earer\s+/i, "") : null);

    // console.log("Token comes in backend auth is: ", token);

    // Development-only bypass: accept x-dev-user header with JSON payload
    if (!token) {
      if (process.env.NODE_ENV !== "production" && req.headers["x-dev-user"]) {
        try {
          const devUser = JSON.parse(req.headers["x-dev-user"]);
          // minimal validation
          if (devUser && devUser.id && devUser.accountType) {
            req.user = devUser;
          } else {
            return res.status(401).json({ success: false, message: "Invalid x-dev-user header." });
          }
        } catch (err) {
          return res.status(401).json({ success: false, message: "Invalid x-dev-user JSON." });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: "Authorization token is missing.",
        });
      }
    } else {
      // Verify the token
      try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        console.log("Decoded user from auth: ", decode);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: "Token is invalid",
        });
      }
    }
    next();
  } catch (error) {
    res.status(401).json({
      error: error.message,
      success: false,
      message: "Some error occurred while verifying the token.",
    });
  }
};

// isStudent
exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for students only.",
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "User role can't be verified, please try again.",
    });
  }
};

// isInstructor
exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for instructors only.",
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "User role can't be verified, please try again.",
    });
  }
};

// isAdmin
exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for admins only.",
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "User role can't be verified, please try again.",
    });
  }
};
