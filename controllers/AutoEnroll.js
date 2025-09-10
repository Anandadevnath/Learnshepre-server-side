const Course = require("../models/Course");
const User = require("../models/User");

exports.autoEnroll = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, message: "Course ID required." });
    }
    const course = await Course.findById(courseId);
    const user = await User.findById(userId);
    if (!course || !user) {
      return res.status(404).json({ success: false, message: "Course or user not found." });
    }
    // Add user to course.studentsEnrolled if not already present
    if (!course.studentsEnrolled.includes(userId)) {
      course.studentsEnrolled.push(userId);
      await course.save();
    }
    // Add course to user.courses if not already present
    if (!user.courses.includes(courseId)) {
      user.courses.push(courseId);
      await user.save();
    }
    return res.status(200).json({ success: true, message: "User enrolled in course." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
