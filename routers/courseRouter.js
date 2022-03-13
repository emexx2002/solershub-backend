// courseRouter.js - courses route model
const express = require("express");
const courseController = require("../controllers/courseController");
const router = express.Router();

router.get("/single/:id", courseController.getOneCourse);
router.get("/", courseController.getAllCourses);
router.get("/search", courseController.searchCourses);

module.exports = router;
