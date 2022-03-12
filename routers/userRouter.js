const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.userSignUp);
router.post("/login", authController.loginAsUser);

module.exports = router;
