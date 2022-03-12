// courseRouter.js - courses route model
const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.instructorSignUp);
router.post("/login", authController.loginAsInstructor);

module.exports = router;
