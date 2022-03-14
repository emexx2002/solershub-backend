const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Every section must have a name!"],
  },
  sub: [
    {
      type: Object,
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  ownerCourse: { type: Schema.Types.ObjectId, ref: "Course" },
  index: Number,
});

const Section = new mongoose.model("Section", sectionSchema);

module.exports = Section;
