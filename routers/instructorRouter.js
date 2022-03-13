// courseRouter.js - courses route model
const express = require("express");
const authController = require("../controllers/authController");
const instructorController = require("../controllers/instructorController");
const courseController = require("../controllers/courseController");

const router = express.Router();

router.get("/", instructorController.getAllInstructors);
router.get("/:id", instructorController.getOneInstructor);
router.delete("/:id", instructorController.deleteOneInstructor);
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

router.patch("/me/password/update", authController.updatePasswordInstructor);
router.patch("/me/email/update", authController.updateEmailInstructor);
router.delete("/me/delete", instructorController.deleteMe);
router.patch("/me/image/upload", instructorController.uploadImage);
router.patch("/me/basic/update", instructorController.updateOneInstructor);
router.post("/courses/create", courseController.createCourse);
router.patch("/courses/publish/:courseId", courseController.publishCourse);
router.patch("/courses/update/:courseId", courseController.updateCourseBasic);
router.patch("/courses/:courseId/image/upload", courseController.courseMiddleware, courseController.addCourseBackground);


module.exports = router;
