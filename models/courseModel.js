const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Every user must have a name!"],
  },
  image: {
    type: String,
  },
  owner: {
    type: String,
    required: [true, "Every course must have an owner!"],
  },
  sections: [{ type: Object }],
  rating: Number,
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
  enrolled: Number,
  published: Boolean,
  status: String,
});

const Course = new mongoose.model("Course", courseSchema);

module.exports = Course;
