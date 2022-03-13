const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getOneUser);
router.delete("/:id", userController.deleteOneUser);
router.post("/signup", authController.userSignUp);
router.post("/login", authController.loginAsUser);
router.post("/password/forgot", authController.sendResetURLUser);
router.get("/password/reset/:id/:token", authController.resetPasswordUser);
router.get("/confirm/:id/:token", authController.confirmUser);
router.get("/email/reset/:id/:token", authController.confirmUser);

router.use(authController.protectUser);

router.patch("/me/password/update", authController.updatePasswordUser);
router.patch("/me/email/update", authController.updateEmailUser);
router.delete("/me/delete", userController.deleteMe);
router.patch("/me/image/upload", userController.uploadImage);

module.exports = router;
