const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");

const makeImageStorage = (participant, type) => {
  const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `public/images/${type}s`);
    },
    filename: (req, file, cb) => {
      const fileext = path.extname(file.originalname);
      cb(null, `${participant.id}${fileext}`);
    },
  });

  return imageStorage;
};

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

exports.uploadImage = (Model, type) =>
  catchAsync(async (req, res, next) => {
    let participant;

    if (type === "user") {
      participant = req.user;
    } else if (type === "instructor") {
      participant = req.instructor;
    } else {
      participant = req.course;
    }

    const imageStorage = makeImageStorage(participant, type);
    const upload = multer({ storage: imageStorage }).single("image");

    upload(req, res, async (err) => {
      if (err) {
        console.log(err);
        return next(new AppError(err.message, 500));
      }

      const filename = req.file.filename;

      await Model.findByIdAndUpdate(participant.id, {
        image: `public/images/${type}s/${filename}`,
      });

    //   await sharp(`${req.file.destination}/${req.file.filename}`)
    //     .resize(500, 500)
    //     .toFormat("jpeg")
    //     .jpeg({
    //       quality: 90,
    //     })
    //     .toFile(`public/images/${type}s/2${filename}`);

      res.status(201).json({
        status: "success",
        message: "Image successfully saved",
      });
    });
  });
