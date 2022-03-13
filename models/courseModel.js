const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Every user must have a name!"],
    unique: [true, "There is already a course woth this name!"],
  },
  image: {
    type: String,
  },
  owner: {
    type: String,
    required: [true, "Every course must have an owner!"],
  },
  sections: [{ type: Object }],
  rating: { type: Number, default: 0 },
  reviews: [{ type: Object }],
  description: {
    type: String,
    required: [true, "Every course must have a description!"],
  },
  price: {
    type: Number,
    required: [true, "Every course must have a price!"],
  },
  categories: [
    {
      type: String,
      required: [true, "Every course must have at least one category!"],
    },
  ],
  enrolled: {
    type: Number,
    default: 0,
  },
  published: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    default: "inactive",
  },
});

const Course = new mongoose.model("Course", courseSchema);

module.exports = Course;
