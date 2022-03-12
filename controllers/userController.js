const User = require("../models/userModel");
const factoryController = require("./factoryController");
const AppError = require("../utils/appError");
const catchAsync = require('../utils/catchAsync')

let users, user;

// Controller function to get all users
exports.getAllUsers = factoryController.getAll(User, users, false, "users");

// Controller function to get single user
exports.getOneUser = factoryController.getOne(User, user, "user");

// Controller function to delete a user
exports.deleteOneUser = factoryController.deleteOne(User, 'user');

// Controller function to delete a user
exports.deleteMe = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  user = await User.findById(id);

  if (!user) {
    return next(new AppError("No user found with that identifier", 404));
  }

  await User.findByIdAndDelete(id);

  res.status(204).json({
    data: null,
  });
});
