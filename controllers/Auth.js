const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
require("dotenv").config();
const { mailSender } = require("../utils/mailSender");
const passwordUpdateTemplate = require("../mail/templates/passwordUpdate");

// OTP functionality removed: signup is direct now.

// Signup

exports.signUp = async (req, res) => {
  try {
    // data fetch from body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
    } = req.body;

    // validate data
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // check password and confirmpassword
    if (password !== confirmPassword) {
      return res.status(403).json({
        success: false,
        message: "Both passwords should be same. Please re-check both of them.",
      });
    }

    // check if user already exists or not
    const checkUser = await User.findOne({ email: email });
    if (checkUser) {
      return res.status(400).json({
        success: false,
        message: "User is already registered.",
      });
    }

  // OTP validation removed

    // hash password
    const hashedPass = await bcrypt.hash(password, 10);

    // db entry
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPass,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(
        firstName
      )}%20${encodeURIComponent(lastName)}`,
    });

    // return success response
    res.status(201).json({
      success: true,
      message: "User is signed up successfully.",
      userData: {
        user: {
          data: user,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Some error occurred while signing up. Please try again!",
    });
  }
};

// Dev-only: auto signup/login a test user. Safe-guarded to non-production.
exports.devAutoSignupLogin = async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        message: "Dev auto signup is disabled in production.",
      });
    }

    const {
      firstName = process.env.DEV_FIRSTNAME || "Dev",
      lastName = process.env.DEV_LASTNAME || "User",
      email = process.env.DEV_EMAIL || "dev@local.test",
      password = process.env.DEV_PASSWORD || "devpassword",
      accountType = process.env.DEV_ACCOUNT_TYPE || "student",
    } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "email and password required" });
    }

    // If user exists, just login
    let existingUser = await User.findOne({ email }).populate("additionalDetails").exec();
    if (!existingUser) {
      const hashedPass = await bcrypt.hash(password, 10);

      const profileDetails = await Profile.create({ gender: null, dateOfBirth: null, about: null, contactNumber: null });

      existingUser = await User.create({
        firstName,
        lastName,
        email,
        contactNumber: null,
        password: hashedPass,
        accountType,
        additionalDetails: profileDetails._id,
        image: `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(firstName)}%20${encodeURIComponent(lastName)}`,
      });
    }

    // create token and return same format as login
    const payload = { email: existingUser.email, id: existingUser._id, accountType: existingUser.accountType };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });

    const userObj = existingUser.toObject ? existingUser.toObject() : existingUser;
    userObj.token = token;
    userObj.password = undefined;

    const options = { expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), httpOnly: true };
    return res.status(200).cookie("authToken", token, options).json({
      success: true,
      message: "Dev user signed in.",
      loggedUser: { token: token, dataUser: { data: userObj } },
    });
  } catch (error) {
    console.log("Dev signup/login error:", error);
    return res.status(500).json({ success: false, message: "Dev signup/login failed." });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fileds are mandatory.",
      });
    }
    const existingUser = await User.findOne({ email })
      .populate("additionalDetails")
      .exec();
    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "User doesn't exists. Please register first.",
      });
    }

    const payload = {
      email: existingUser.email,
      id: existingUser._id,
      accountType: existingUser.accountType,
    };

    if (await bcrypt.compare(password, existingUser.password)) {
      // password matched
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      const user = existingUser.toObject();
      user.token = token;
      user.password = undefined;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res
        .status(200)
        .cookie("authToken", token, options)
        .json({
          success: true,
          message: "User logged in successfully.",
          loggedUser: {
            token: token,
            dataUser: {
              data: user,
            },
          },
        });
    } else {
      // password doesn't match
      const errorMessage =
        "Password is incorrect. Please re-type the correct password.";
      return res.status(401).json({
        success: false,
        message: errorMessage,
      });
    }
  } catch (error) {
    console.log("Error: ", error.message);

    res.status(500).json({
      success: false,
      message: "Some error occurred while login. Please try again.",
    });
  }
};

// change password

exports.changePassword = async (req, res) => {
  try {
    // Get data from req body
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    const email = req.user.email || req.user.body;

    // Find the existing user
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "No user present with this email.",
      });
    }

    // Validate old password
    const isOldPasswordCorrect = await bcrypt.compare(
      oldPassword,
      existingUser.password
    );
    if (!isOldPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect.",
      });
    }

    // Check if new password matches the old password
    const isSameAsOldPassword = await bcrypt.compare(
      newPassword,
      existingUser.password
    );
    if (isSameAsOldPassword) {
      return res.status(401).json({
        success: false,
        message: "This password has already been used. Try another one.",
      });
    }

    // Check if new password matches confirmation password
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "Both passwords should match. Please re-check both fields.",
      });
    }

    // Hash the new password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await User.updateOne(
      { email }, // Find the user by email
      { $set: { password: newHashedPassword } } // Only update the password
    );

    // Send email notification
    try {
      await mailSender(
        email,
        "Password Updated - Learn Sphere",
        passwordUpdateTemplate(existingUser.firstName, existingUser.email)
      );
    } catch (mailError) {
      console.error("Failed to send email notification:", mailError.message);
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Password has been updated.",
    });
  } catch (error) {
    console.error("Error while updating password:", error.message);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while updating the password. Please try again.",
    });
  }
};
