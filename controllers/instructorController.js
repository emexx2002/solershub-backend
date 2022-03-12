const Instructor = require("../models/instructorModel");
const factoryController = require("./factoryController");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

let instructors, instructor;

exports.getAllInstructors = factoryController.getAll(
  Instructor,
  instructors,
  false,
  "instructors"
);

exports.getOneInstructor = factoryController.getOne(Instructor, instructor, "instructor");

exports.deleteOneInstructor = factoryController.deleteOne(Instructor, 'instructor');

exports.deleteMe = catchAsync(async (req, res, next) => {
    const { id } = req.instructor;
    console.log(id)
  instructor = await Instructor.findById(id);

  if (!instructor) {
    return next(new AppError("No instructor found with that identifier", 404));
  }

  await Instructor.findByIdAndDelete(id);

  res.status(204).json({
    data: null,
  });
});
