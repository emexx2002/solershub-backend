const mongoose = require("mongoose");
const emailVal = require("email-validator");
const { Schema } = require("mongoose");

function makeid() {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Every user must have a name!"],
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
  birthday: [
    { type: Date, required: [true, "Every user must have a birthday!"] },
  ],
  ref: { type: String, default: makeid },
  referred: [{ type: Schema.Types.ObjectId, ref: "User" }],
  referredBy: {
    type: String,
  },
  paymentOptions: {
    type: Object,
  },
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
});

const User = mongoose.model("User", userSchema);

module.exports = User;
