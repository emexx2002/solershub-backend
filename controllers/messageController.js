const Email = require("../utils/email");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../utils/appError");

exports.sendMessage = catchAsync(async (req, res, next) => {
  const { option, message, subject, key } = req.body;
  const users = await User.find();
  let choice;

  if (!(key === process.env.EMAIL_SENDER_KEY)) {
    return next(
      new AppError("You are not authorized to perform this action", 401)
    );
  }

  if (!message || !subject) {
    return next(
      new AppError("Please pass email message and subject in request body", 400)
    );
  }

  if (
    !option ||
    (!(option === "paid") && !(option === "access") && !(option === "all"))
  ) {
    return next(
      new AppError(
        "Please pass option in request body as either paid or access or all",
        400
      )
    );
  }

  if (!(option === "all")) {
    if (option === "paid") {
      users.map((user) => {
        if (
          !(user.paymentOptions.paid == undefined) &&
          user.paymentOptions.paid === true
        ) {
          choice.push(user);
        }
      });
    } else if (option === "access") {
      users.map((user) => {
        if (
          !user.paymentOptions.access &&
          user.paymentOptions.access === true
        ) {
          choice.push(user);
        }
      });
    }
  } else {
    choice = users;
  }

  const errorsArr = [];
  if (choice) {
    await Promise.all(
      choice.map(async (person) => {
        const emailSender = new Email(
          process.env.SENDGRID_API_KEY,
          person.email
        );
        try {
          await emailSender.sendMessage(message, subject);
        } catch (err) {
          errorsArr.push(err);
        }
      })
    );

    if (errorsArr.length === choice.length) {
      return res.status(500).json({
        status: "failed",
        message: "An error occured from email client",
      });
    } else {
      res.status(200).json({
        status: "success",
        message: `${choice.length} emails attempted, ${errorsArr.length} failed and ${choice.length} succeeded`,
      });
    }
  } else {
    res.status(200).json({
      status: "success",
      message: "No user matches the criteria in option",
    });
  }
});
