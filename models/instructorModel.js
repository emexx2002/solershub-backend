const mongoose = require("mongoose");
const emailVal = require("email-validator");
const { Schema } = require("mongoose");

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
    validate: {
      validator: emailVal.validate,
    },
  },
  password: {
    type: String,
    required: [true, "Every user must have a password!"],
  },
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  image: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verifyHash: String,
  passwordResetExpires: Date,
  passwordChangeDate: Date,
  phone: String,
});

instructorSchema.pre(/^find/, function (next) {
  this.populate("courses");
  next();
});

const Instructor = mongoose.model("Instructor", instructorSchema);

module.exports = Instructor;
