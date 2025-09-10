const express = require("express");
const router = express.Router();
const { autoEnroll } = require("../controllers/AutoEnroll");
const { auth } = require("../middlewares/auth");

router.post("/autoEnroll", auth, autoEnroll);

module.exports = router;
