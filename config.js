const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

configuration = {
  DB_DEV: process.env.DB_DEV,
  DB_PROD: process.env.DB_PROD,
  ENV: process.env.ENV,
  PORT: process.env.PORT,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  TOKEN_RESET_URL_DEV: process.env.TOKEN_RESET_URL_DEV,
  TOKEN_RESET_URL_PROD: process.env.TOKEN_RESET_URL_PROD,
  CONFIRMATION_LINK_DEV: process.env.CONFIRMATION_LINK_DEV,
  CONFIRMATION_LINK_PROD: process.env.CONFIRMATION_LINK_PROD,
};

module.exports = configuration;
