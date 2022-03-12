const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAll = (Model, doc, course, name) =>
  catchAsync(async (req, res, next) => {
    const { limit, page } = req.query;
    const skip = (page - 1) * limit;
    if (course) {
      doc = await Model.find({ published: true, status: "active" })
        .skip(offset)
        .limit(limit);
    } else {
      doc = await Model.find().skip(skip).limit(limit);
    }
    const count = await Model.count();

    const totalPages = Math.ceil(count / limit);
    const currentPage = Math.ceil(count % skip);

    let instructors, courses, users;
    if (name === "instructors") {
      instructors = doc;
      res.status(200).json({
        status: "success",
        results: instructors.length,
        paging: {
          total: count,
          page: currentPage,
          pages: totalPages,
        },
        data: { instructors },
      });
    } else if (name === "users") {
      users = doc;
      res.status(200).json({
        status: "success",
        results: users.length,
        paging: {
          total: count,
          page: totalPages,
          pages: totalPages,
        },
        data: { users },
      });
    } else if (name === "courses") {
      courses = doc;
      res.status(200).json({
        status: "success",
        results: courses.length,
        paging: {
          total: count,
          page: totalPages,
          pages: totalPages,
        },
        data: { courses },
      });
    }
  });

exports.getOne = (Model, doc, name) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    doc = await Model.findById(id);
    if (!doc) {
      return next(new AppError(`No ${name} found with that identifier`, 404));
    }

    let instructor, course, user;
    if (name === "instructor") {
      instructor = doc;
      res.status(200).json({
        status: "success",
        data: {
          instructor,
        },
      });
    } else if (name === "user") {
      user = doc;
      res.status(200).json({
        status: "success",
        data: {
          user,
        },
      });
    } else if (name === "course") {
      course = doc;
      res.status(200).json({
        status: "success",
        data: {
          course,
        },
      });
    }
  });

exports.deleteOne = (Model, name) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findById(id);

    if (!doc) {
      return next(new AppError(`No ${name} found with that identifier`, 404));
    }
    await Model.findByIdAndDelete(id);
    res.status(204).json({
      data: null,
    });
  });
