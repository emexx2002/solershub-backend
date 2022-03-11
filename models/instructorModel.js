const mongoose = require("mongoose");

const instructorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Every user must have a name!"],
  },
  description: {
    type: String,
    required: [true, "Every instructor must have a description!"],
  },
  email: {
    type: String,
    required: [true, "Every user must have an email address!"],
    unique: [true, "Email already in use by another user!"],
  },
  password: {
    type: String,
    required: [true, "Every user must have a password!"],
  },
  courses: [
    {
      type: Object,
    },
  ],
  image: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: true,
  },
  verifyHash: String,
  passwordResetExpires: Date,
});

const Instructor = mongoose.model("Instructor", instructorSchema);

module.exports = Instructor