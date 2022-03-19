const mongoose = require("mongoose");
const { Schema } = require("mongoose");

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
  sections: [{ type: Schema.Types.ObjectId, ref: "Section" }],
  ratingsAverage: { type: Number, default: 0 },
  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
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
  enrolledAmount: {
    type: Number,
    default: 0,
  },
  enrolledUsers: [{ type: Object }],
  summary: {
    type: String,
    required: [true, "Every course must have a summary"],
  },
  published: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    default: "inactive",
  },
  phone: String,
});

courseSchema.pre(/^find/, function (next) {
  this.populate("sections").populate("reviews");
  next();
});

const Course = new mongoose.model("Course", courseSchema);

module.exports = Course;
