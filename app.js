const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const userRouter = require("./routers/userRouter");
const instructorRouter = require("./routers/instructorRouter");
const courseRouter = require("./routers/courseRouter");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

app.use(cors());

if (process.env.ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/instructors", instructorRouter);
app.use("/api/v1/courses", courseRouter);

app.use(globalErrorHandler);

module.exports = app;
