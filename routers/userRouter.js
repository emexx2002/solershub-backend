const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.userSignUp);
router.post("/login", authController.loginAsUser);
router.post("/password/forgot", authController.sendResetURLUser);
router.get("/password/reset/:id/:token", authController.resetPasswordUser);
router.get("/confirm/:id/:token", authController.confirmUser)

router.use(authController.protectUser);

router.patch("/password/update", authController.updatePasswordUser);

module.exports = router;
