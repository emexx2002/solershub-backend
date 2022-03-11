const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");

dotenv.config({ path: "./config.env" });

const app = express();

app.use(cors());

if (process.env.ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());

module.exports = app;
