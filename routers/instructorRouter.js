// courseRouter.js - courses route model
const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.instructorSignUp);
router.post("/login", authController.loginAsInstructor);
router.post("/password/forgot", authController.sendResetURLInstructor);
router.get(
  "/password/reset/:id/:token",
  authController.resetPasswordInstructor
);
router.get("/confirm/:id/:token", authController.confirmInstructor);
router.get("/email/reset/:id/:token", authController.confirmInstructor);

router.use(authController.protectInstructor);

router.patch("/password/update", authController.updatePasswordInstructor);
router.patch("/email/update", authController.updateEmailInstructor)

module.exports = router;
