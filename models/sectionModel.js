const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Every section must have a name"],
  },
  sub: [
    {
      type: Object,
    },
  ],
});

const Section = new mongoose.model("Section", sectionSchema);

module.exports = Section;
