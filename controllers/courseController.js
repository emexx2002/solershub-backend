const Course = require("../models/courseModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factoryController = require("./factoryController");

let course, courses;

exports.createCourse = catchAsync(async (req, res, next) => {
  instructor = req.instructor;
  const { name, description, price, categories } = req.body;

  if (!name || !description || !price || !categories) {
    return next(
      new AppError(
        "Please include name, description, categories and price!",
        400
      )
    );
  }

  const course = await Course.findOne({ name });

  if (course) {
    return next(new AppError("There is already a course with this name!", 400));
  }

  const categoriesSplit = categories.split(",");

  parameters = {
    name,
    description,
    price,
    owner: instructor.id,
    categories: categoriesSplit,
  };

  const newCourse = await Course.create(parameters);

  res.status(201).json({
    status: "success",
    message: "Course successfully created",
    data: {
      course: newCourse,
    },
  });
});

exports.publishCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const instructor = req.instructor;

  const course = await Course.findById(courseId);

  if (!course) {
    return next(new AppError("No course found with that identifier", 404));
  }

  if (!(course.owner === instructor.id)) {
    return next(
      new AppError("You are not authorized to perform this action", 401)
    );
  }

  await Course.findByIdAndUpdate(courseId, { published: true });

  course.published = true;

  res.status(201).json({
    status: "success",
    message: "Course successfully updated",
    data: { course },
  });
});

exports.updateCourseBasic = catchAsync(async (req, res, next) => {
  const { name, description, price, categories, status } = req.body;
  const { courseId } = req.params;
  const instructor = req.instructor;

  if (status) {
    if (!(status === "active") && !(status === "inactive")) {
      return next(
        new AppError("Course status can only be 'active' or 'inactive'", 400)
      );
    }
  }

  const course = await Course.findById(courseId);

  if (!course) {
    return next(new AppError("No course found with that id", 404));
  }

  if (!(course.owner === instructor.id)) {
    return next(
      new AppError("You are not authorized to perform this action", 401)
    );
  }

  const categoriesArr = categories.split(",");
  const parameters = {
    name,
    description,
    price,
    categories: categoriesArr,
    status,
  };

  console.log(parameters);

  await Course.findByIdAndUpdate(course.id, parameters);

  const updatedCourse = await Course.findById(course.id);

  res.status(201).json({
    status: "success",
    message: "Course successfully updated",
    data: {
      course: updatedCourse,
    },
  });
});

exports.getOneCourse = factoryController.getOne(Course, course, "course");

exports.getAllCourses = factoryController.getAll(
  Course,
  courses,
  true,
  "courses"
);

exports.searchCourses = catchAsync(async (req, res, next) => {
  const { q } = req.query;

  courses = await Course.find({ published: true, status: "active" })

  selectedCourses = [];
  courses.map((course) => {
    if (course.name.includes(q) || course.categories.includes(q)) {
      selectedCourses.push(course);
    }
  });


  res.status(200).json({
    status: "success",
    results: selectedCourses.length,
    data: { selectedCourses },
  });
});
