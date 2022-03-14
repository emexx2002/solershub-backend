const Course = require("../models/courseModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factoryController = require("./factoryController");
const Section = require("../models/sectionModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

let course, courses;

exports.createCourse = catchAsync(async (req, res, next) => {
  instructor = req.instructor;
  const { name, description, price, categories, summary } = req.body;

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
    summary
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

  courses = await Course.find({ published: true, status: "active" });

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

exports.courseMiddleware = catchAsync(async (req, res, next) => {
  const courseId = req.params.courseId;
  const course = await Course.findById(courseId);

  if (!course) {
    return next(new AppError("No course found with that identifier", 404));
  }

  if (!(req.instructor.id === course.owner)) {
    return next(
      new AppError("You are not authorized to perform this action!", 401)
    );
  }

  req.course = course;
  next();
});

exports.addCourseBackground = factoryController.uploadImage(Course, "course");

exports.addCourseSection = catchAsync(async (req, res, next) => {
  const { name, index } = req.body;

  const course = req.course;

  if (!name) {
    return next(
      new AppError("Please pass the name attribute in the request body", 400)
    );
  }

  const sectionCheck = await Section.findOne({ name });
  if (sectionCheck) {
    return next(
      new AppError("There is already a section with this name!", 400)
    );
  }

  let ind;
  if (index == undefined) {
    ind = course.sections.length;
  } else {
    ind = index;
  }

  if (ind < 0 || ind > course.sections.length) {
    return next(
      new AppError(
        "Index cannot be negative or higher than the number of sections in course",
        400
      )
    );
  }

  const sectionsForCourse = await Section.find({
    ownerCourse: course.id,
    index: { $gte: ind },
  });

  await Promise.all(
    sectionsForCourse.map(async (section) => {
      newInd = section.index + 1;
      section.index = newInd;
      await Section.findByIdAndUpdate(section, section);
    })
  );

  const section = await Section.create({
    name,
    index: ind,
    ownerCourse: course.id,
  });

  course.sections.push(section.id);

  await Course.findByIdAndUpdate(course.id, course);
  const updatedCourse = await Course.findById(course.id);

  res.status(201).json({
    status: "success",
    message: "Successfully created new course section",
    data: { course: updatedCourse },
  });
});

exports.deleteCourseSection = catchAsync(async (req, res, next) => {
  const { sectionId } = req.params;
  const course = req.course;

  const section = await Section.findById(sectionId);

  if (!section) {
    return next(new AppError("No section found with that identifier!", 404));
  }

  await Section.findByIdAndDelete(sectionId);
  const sections = await Section.find({
    ownerCourse: course.id,
    index: { $gte: section.index },
  });
  await Promise.all(
    sections.map(async (sec) => {
      newInd = sec.index - 1;
      sec.index = newInd;
      await Section.findByIdAndUpdate(sec.id, sec);
    })
  );

  res.status(204).json({
    status: "success",
    message: "Course section deleted successfully",
    data: { course },
  });
});

exports.updateCourseSection = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const { sectionId } = req.params;

  const course = req.course;

  if (!name) {
    return next(new AppError("No data to update found", 400));
  }

  const section = await Section.findById(sectionId);
  if (!section) {
    return next(new AppError("No section found with that identifier!", 404));
  }

  section.name = name;
  await Section.findByIdAndUpdate(sectionId, section);

  const updatedCourse = await Course.findById(course.id);

  res.status(201).json({
    status: "success",
    message: "Course section updated successfully",
    data: { course: updatedCourse },
  });
});

exports.addSubsectionVideo = catchAsync(async (req, res, next) => {
  const { sectionId } = req.params;
  const { videoText, videoTitle, videoURL, index } = req.body;
  const course = req.course;

  const section = await Section.findById(sectionId);
  if (!section) {
    return next(new AppError("No section found with that identifier!", 404));
  }

  let ind;
  if (index == undefined) {
    ind = section.sub.length;
    console.log("NO INDEX FOUND");
  } else {
    ind = index;
    console.log("INDEX FOUND");
  }
  // console.log(ind);

  if (ind < 0 || ind > section.sub.length) {
    return next(
      new AppError(
        "Index cannot be negative or higher than the number of assets in section",
        400
      )
    );
  }
  // console.log(ind);

  const asset = {
    type: "video",
    videoText,
    videoTitle,
    videoURL,
    index: ind,
    date: Date.now(),
  };
  // console.log(ind);

  for (i = 0; i < section.sub.length; i++) {
    if (section.sub[i].index >= ind) {
      newInd = section.sub[i].index + 1;
      section.sub[i].index = newInd;
    }
  }

  section.sub.push(asset);
  section.sub.sort((a, b) => a.index - b.index);
  await Section.findByIdAndUpdate(section.id, section);

  const updatedCourse = await Course.findById(course.id);
  return res.status(201).json({
    status: "success",
    message: "Section Video Successfully Added",
    data: { course: updatedCourse },
  });
});

exports.addSubsectionText = catchAsync(async (req, res, next) => {
  const { sectionId } = req.params;
  const { text, textTitle, index } = req.body;
  const course = req.course;

  const section = await Section.findById(sectionId);
  if (!section) {
    return next(new AppError("No section found with that identifier!", 404));
  }

  let ind;
  if (index == undefined) {
    ind = section.sub.length;
    console.log("NO INDEX FOUND");
  } else {
    ind = index;
    console.log("INDEX FOUND");
  }
  // console.log(ind);

  if (ind < 0 || ind > section.sub.length) {
    return next(
      new AppError(
        "Index cannot be negative or higher than the number of assets in section",
        400
      )
    );
  }
  // console.log(ind);

  const asset = {
    type: "text",
    text,
    textTitle,
    index: ind,
    date: Date.now(),
  };
  // console.log(ind);

  for (i = 0; i < section.sub.length; i++) {
    if (section.sub[i].index >= ind) {
      newInd = section.sub[i].index + 1;
      section.sub[i].index = newInd;
    }
  }

  section.sub.push(asset);
  section.sub.sort((a, b) => a.index - b.index);
  await Section.findByIdAndUpdate(section.id, section);

  const updatedCourse = await Course.findById(course.id);
  return res.status(201).json({
    status: "success",
    message: "Section Text Successfully Added",
    data: { course: updatedCourse },
  });
});

exports.deleteOneAsset = catchAsync(async (req, res, next) => {
  const { sectionId } = req.params;
  const index = req.body.index;

  if (index == undefined) {
    return next(
      new AppError(
        "Please provide the indexof the asset to be deleted in the request body",
        400
      )
    );
  }

  const section = await Section.findById(sectionId);
  if (!section) {
    return next(new AppError("No section found with that identifier!", 404));
  }

  course = req.course;
  const decisionArr = [];
  const newAssets = [];

  section.sub.map((asset) => {
    if (asset.index === index) {
      decisionArr.push(true);
    } else if (!(asset.index === index)) {
      decisionArr.push(false);
      newAssets.push(asset);
    }
  });

  console.log(newAssets);

  if (!decisionArr.includes(true)) {
    return next(
      new AppError("No asset with this index was found on the subsection!", 404)
    );
  }

  newAssets.map((asset) => {
    if (asset.index >= index) {
      newInd = asset.index - 1;
      asset.index = newInd;
    }
  });

  section.sub = newAssets;
  section.sub.sort((a, b) => a.index - b.index);

  await Section.findByIdAndUpdate(section.id, section);
  const updatedCourse = await Course.findById(course.id);
  return res.status(204).json({
    status: "success",
    message: "Section Text Successfully Added",
    data: { course: updatedCourse },
  });
});

// exports.getCheckoutSession = catchAsync(async (req, res, next) => {
//   const course = req.course;
//   const user = req.user;

//   stripe.checkout.session.create({
//     payment_method_types: ["card"],
//     success_url: `${req.protocol}://${req.get("host")}/`,
//     cancel_url: `${req.protocol}://${req.get("host")}/courses/${course.id}`,
//     customer_email: user.email,
//     client_reference_id: course.id,
//     line_items: [
//       {
//         name: `${course.name} Course`,
//         description: course.summary,
//         images: [`${process.env.PROD_HOMEPAGE}/${course.image}`]
//       }
//     ]
//   });
// });

// exports.rateCourse = catchAsync(async (req, res, next) => {
//   const user = req.user;
//   const { courseId } = req.params;
//   const { rating, review } = req.body;

//   const course = await Course.findById(courseId);
//   if (!course) {
//     return next(new AppError("No course found with that identifier", 404));
//   }

//   let choice;
//   const choiceArr = [];

//   user.courses.map((userCourse) => {
//     if (userCourse.id === course.id) {
//       choiceArr.push(true);
//     } else {
//       choiceArr.push(false);
//     }
//   });

//   if (choiceArr.includes(true)) {
//     choice = true;
//   } else {
//     choice = false;
//   }

//   if (choice === true) {
//     return next(
//       new AppError(
//         "You do not have the permission to rate the course as you have not enrolled",
//         401
//       )
//     );
//   }

// });
