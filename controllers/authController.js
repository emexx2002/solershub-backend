const User = require("../models/userModel");
const Instructor = require("../models/instructorModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Email = require("../utils/email");
const crypto = require("crypto");
const config = require("../config");
const { promisify } = require("util");

let CONFIRM_URL, TOKEN_RESET_URL;
SENDGRID_API_KEY = config.SENDGRID_API_KEY;

if (config.ENV === "development") {
  CONFIRM_URL = config.CONFIRMATION_LINK_DEV;
  TOKEN_RESET_URL = config.TOKEN_RESET_URL_DEV;
} else {
  CONFIRM_URL = config.CONFIRMATION_LINK_PROD;
  TOKEN_RESET_URL = config.TOKEN_RESET_URL_PROD;
}

const resetResponse = (res, minutes, link) => {
  res.status(200).json({
    status: "success",
    message: `A link-${link} has been sent to this email address if it exists on this server. Expires in ${minutes} minutes`,
  });
};

const hashPassword = async (salt, password) => {
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

const sign = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
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
  const { name, email, password, referredBy, birthday } = req.body;
  let referrer;

  if (!name || !email || !password || !birthday) {
    return next(
      new AppError(
        "Please pass name, email, password and birthday in request body",
        400
      )
    );
  }

  const paymentOptions = {
    paid: false,
    access: false,
  };

  const user = {
    name,
    email,
    password,
    birthday,
    paymentOptions,
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

  if (referredBy) {
    referrer = await User.findOne({ ref: referredBy });
    if (!referrer) {
      return next(new AppError("No user found with that reference code", 400));
    }

    user.referredBy = referrer.id;
  }

  user.password = await hashPassword(10, user.password);
  user.passwordChangeDate = Date.now();

  const newUser = await User.create(user);
  if (referredBy) {
    referrer.referred.push(newUser.id);
    await User.findByIdAndUpdate(referrer.id, referrer);
  }

  newUser.password = undefined;
  const emailSender = new Email(SENDGRID_API_KEY, newUser.email);
  const verifyToken = crypto.randomBytes(15).toString("hex");
  await User.findByIdAndUpdate(newUser.id, { verifyHash: verifyToken });
  await emailSender.sendWelcome(
    `${CONFIRM_URL}users/confirm/${newUser.id}/${verifyToken}`
  );

  if (referredBy) {
    await emailSender.sendReferralMessageSignUp(referrer.email, newUser);
  }

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
  instructor.passwordChangeDate = Date.now();

  const newInstructor = await Instructor.create(instructor);
  newInstructor.password = undefined;

  const emailSender = new Email(SENDGRID_API_KEY, newInstructor.email);
  const verifyToken = crypto.randomBytes(15).toString("hex");
  await User.findByIdAndUpdate(newInstructor.id, { verifyHash: verifyToken });
  await emailSender.sendWelcome(
    `${CONFIRM_URL}instructors/confirm/${newInstructor.id}/${verifyToken}`
  );

  createSendToken(newInstructor, 201, res);
});

exports.loginAsInstructor = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError("Please provide email and password for this user", 400)
    );
  }

  let instructor = await Instructor.findOne({ email, verified: true });

  if (!instructor.password) {
    return next(
      new AppError("Please go to the update route to update password", 401)
    );
  }

  if (!instructor || !(await bcrypt.compare(password, instructor.password))) {
    return next(
      new AppError(
        "Incorrect email or password! Or check if account has been verified",
        401
      )
    );
  }

  const passwordChangeDate = Date.now();
  await Instructor.findByIdAndUpdate(instructor.id, {
    passwordChangeDate,
  });

  createSendToken(instructor, 200, res);
});

exports.loginAsUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError("Please provide email and password for this user", 400)
    );
  }

  let user = await User.findOne({ email, verified: true });

  if (!user.password) {
    return next(
      new AppError("Please go to the update route to update password", 401)
    );
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(
      new AppError(
        "Incorrect email or password! Or check if account has been verified",
        401
      )
    );
  }

  const passwordChangeDate = Date.now();
  await User.findByIdAndUpdate(user.id, {
    passwordChangeDate,
  });

  createSendToken(user, 200, res);
});

exports.protectUser = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    return next(
      new AppError("You are not logged in, please log in to gain access!", 404)
    );
  }

  const decoded = await decodeJWT(token);
  const id = decoded.id;

  let user;
  user = await User.findById(id);

  if (!user) {
    return next(new AppError("No user found!", 401));
  }

  let changedTimeStamp;
  if (user.passwordChangeDate) {
    changedTimeStamp = parseInt(user.passwordChangeDate.getTime() / 1000, 10);
    if (decoded.iat < changedTimeStamp) {
      return next(
        new AppError("User recently changed password! Please log in again", 401)
      );
    }
  }

  req.user = user;
  next();
});

exports.protectInstructor = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    return next(
      new AppError("You are not logged in, please log in to gain access!", 404)
    );
  }

  const decoded = await decodeJWT(token);
  const id = decoded.id;

  let instructor;
  instructor = await Instructor.findById(id);

  if (!instructor) {
    return next(new AppError("No instructor found!", 401));
  }

  let changedTimeStamp;
  if (instructor.passwordChangeDate) {
    changedTimeStamp = parseInt(
      instructor.passwordChangeDate.getTime() / 1000,
      10
    );
    if (decoded.iat < changedTimeStamp) {
      return next(
        new AppError("User recently changed password! Please log in again", 401)
      );
    }
  }

  req.instructor = instructor;
  next();
});

exports.sendResetURLUser = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  const minutesToExpire = 15;
  if (user) {
    const verifyHash = crypto.randomBytes(15).toString("hex");
    const currentDate = new Date();
    const passwordResetExpires = new Date(
      currentDate.getTime() + minutesToExpire * 60000
    );
    await User.findByIdAndUpdate(user.id, { verifyHash, passwordResetExpires });
    const emailSender = new Email(SENDGRID_API_KEY, user.email);
    await emailSender.sendPasswordReset(
      `${TOKEN_RESET_URL}users/password/reset/${user.id}/${verifyHash}`,
      passwordResetExpires
    );
    resetResponse(
      res,
      minutesToExpire,
      `${TOKEN_RESET_URL}users/password/reset/${user.id}/${verifyHash}`
    );
  } else {
    resetResponse(
      res,
      minutesToExpire,
      `${TOKEN_RESET_URL}users/password/reset/${user.id}/${verifyHash}`
    );
  }
});

exports.sendResetURLInstructor = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const instructor = await Instructor.findOne({ email });
  const minutesToExpire = 15;
  if (instructor) {
    const verifyHash = crypto.randomBytes(15).toString("hex");
    const currentDate = new Date();
    const passwordResetExpires = new Date(
      currentDate.getTime() + minutesToExpire * 60000
    );
    await Instructor.findByIdAndUpdate(instructor.id, {
      verifyHash,
      passwordResetExpires,
    });
    const emailSender = new Email(SENDGRID_API_KEY, instructor.email);
    await emailSender.sendPasswordReset(
      `${TOKEN_RESET_URL}instructors/password/reset/${instructor.id}/${verifyHash}`,
      passwordResetExpires
    );
    resetResponse(
      res,
      minutesToExpire,
      `${TOKEN_RESET_URL}instructors/password/reset/${instructor.id}/${verifyHash}`
    );
  } else {
    resetResponse(
      res,
      minutesToExpire,
      `${TOKEN_RESET_URL}instructors/password/reset/${instructor.id}/${verifyHash}`
    );
  }
});

exports.resetPasswordUser = catchAsync(async (req, res, next) => {
  const { id, token } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError("No user found!", 404));
  }

  if (!(user.verifyHash === token)) {
    return next(new AppError("Wrong token", 401));
  }

  const timeToExpire = user.passwordResetExpires.getTime();
  const currentTime = new Date().getTime();

  if (currentTime > timeToExpire) {
    return next(
      new AppError(
        "Token reset URL expired, plese go to forgot password again",
        401
      )
    );
  }

  await User.findByIdAndUpdate(user.id, {
    password: null,
    passwordChangeDate: Date.now(),
  });
  createSendToken(user, 200, res);
});

exports.resetPasswordInstructor = catchAsync(async (req, res, next) => {
  const { id, token } = req.params;
  const instructor = await Instructor.findById(id);
  if (!instructor) {
    return next(new AppError("No user found!", 404));
  }

  if (!(instructor.verifyHash === token)) {
    return next(new AppError("Wrong token", 401));
  }

  const timeToExpire = instructor.passwordResetExpires.getTime();
  const currentTime = new Date().getTime();

  if (currentTime > timeToExpire) {
    return next(
      new AppError(
        "Token reset URL expired, plese go to forgot password again",
        401
      )
    );
  }
  await Instructor.findByIdAndUpdate(instructor.id, {
    password: null,
    passwordChangeDate: Date.now(),
  });

  createSendToken(instructor, 200, res);
});

exports.updatePasswordUser = catchAsync(async (req, res, next) => {
  const { password } = req.body;
  const user = req.user;

  const hashedPassword = await hashPassword(10, password);

  await User.findByIdAndUpdate(user.id, {
    password: hashedPassword,
    passwordChangeDate: Date.now(),
  });

  createSendToken(user, 201, res);
});

exports.updatePasswordInstructor = catchAsync(async (req, res, next) => {
  const { password } = req.body;
  const instructor = req.instructor;

  const hashedPassword = await hashPassword(10, password);

  await Instructor.findByIdAndUpdate(instructor.id, {
    password: hashedPassword,
    passwordChangeDate: Date.now(),
  });

  createSendToken(instructor, 201, res);
});

exports.confirmUser = catchAsync(async (req, res, next) => {
  const { id, token } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError("No user found!", 404));
  }

  if (!(user.verifyHash === token)) {
    return next(new AppError("Wrong token", 401));
  }
  await User.findByIdAndUpdate(user.id, {
    verified: true,
  });
  user.verified = true;
  createSendToken(user, 200, res);
});

exports.confirmInstructor = catchAsync(async (req, res, next) => {
  const { id, token } = req.params;
  const instructor = await Instructor.findById(id);
  if (!instructor) {
    return next(new AppError("No instructor found!", 404));
  }

  if (!(instructor.verifyHash === token)) {
    return next(new AppError("Wrong token", 401));
  }
  await Instructor.findByIdAndUpdate(instructor.id, {
    verified: true,
  });
  instructor.verified = true;
  createSendToken(instructor, 200, res);
});

exports.updateEmailUser = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const verifyHash = crypto.randomBytes(15).toString("hex");

  const emailSender = new Email(SENDGRID_API_KEY, email);

  await emailSender.sendMailReset(
    `${TOKEN_RESET_URL}users/email/reset/${req.user.id}/${verifyHash}`
  );

  const user = await User.findByIdAndUpdate(req.user.id, {
    email,
    verified: false,
    verifyHash,
  });

  res.status(201).json({
    status: "success",
    message: "Please activate new email address",
  });
});

exports.updateEmailInstructor = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const verifyHash = crypto.randomBytes(15).toString("hex");

  const emailSender = new Email(SENDGRID_API_KEY, email);

  await emailSender.sendMailReset(
    `${TOKEN_RESET_URL}instructors/email/reset/${req.instructor.id}/${verifyHash}`
  );

  const instructor = await Instructor.findByIdAndUpdate(req.instructor.id, {
    email,
    verified: false,
    verifyHash,
  });

  res.status(201).json({
    status: "success",
    message: "Please activate new email address",
  });
});
