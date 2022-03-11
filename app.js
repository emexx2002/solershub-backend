const express = require("express");
const morgan = require("morgan");
const cors = require("cors");


const app = express();

app.use(cors());

if (process.env.ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());

module.exports = app;
