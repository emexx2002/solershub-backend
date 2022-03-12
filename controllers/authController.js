const User = require("../models/userModel");
const Instructor = require("../models/instructorModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const hashPassword = async (salt, password) => {
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

const sign = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, code, res) => {
  const token = sign(user.id);
  user.password = undefined;

  res.status(code).json({
    status: "success",
    token: token,
    data: { user },
  });
};

const decodeJWT = async (token) => {
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  return decoded;
};

exports.userSignUp = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(
      new AppError("Please pass name, email and password in request body", 400)
    );
  }

  const user = {
    name,
    email,
    password,
  };

  const users = await User.find();
  let check;

  users.map((user) => {
    if (user.email === email) {
      check = true;
    }
  });

  if (check) {
    return next(new AppError("There is another user with this email", 400));
  }

  user.password = await hashPassword(10, user.password);
  console.log(user.password);

  const newUser = await User.create(user);
  newUser.password = undefined;

  createSendToken(newUser, 201, res);
});

exports.instructorSignUp = catchAsync(async (req, res, next) => {
  const { name, email, password, description } = req.body;

  if (!name || !email || !password || !description) {
    return next(
      new AppError(
        "Please pass name, email, password and description in request body"
      )
    );
  }

  const instructor = {
    name,
    email,
    description,
    password,
  };

  const instructors = await Instructor.find();
  let check;

  instructors.map((instructor) => {
    if (instructor.email === email) {
      check = true;
    }
  });

  if (check) {
    return next(new AppError("There is another user with this email", 400));
  }

  instructor.password = await hashPassword(10, instructor.password);
  console.log(instructor.password);

  const newInstructor = await Instructor.create(instructor);
  newInstructor.password = undefined;

  createSendToken(newInstructor, 201, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    return next(
      new AppError("You are not logged in, please log in to gain access!", 401)
    );
  }

  const decoded = await decodeJWT(token);
  const id = decoded.id;

  let user, instructor, participant;
  user = await User.findById(id);
  instructor = await Instructor.findById(id);

  if (!user && !instructor) {
    return next(new AppError("No user found!", 401));
  }

  if (user && !instructor) {
    participant = user;
  } else if (!user && instructor) {
    participant = instructor;
  }

  req.participant = participant;
  next();
});
