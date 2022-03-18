const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
  },
});

Review = new mongoose.model("Review", reviewSchema);

module.exports = Review;
