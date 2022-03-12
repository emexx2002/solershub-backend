// courseRouter.js - courses route model
const express = require('express')
const router = express.Router()

//Course page route
router.post('/addnewcourse', (res, req) => {
    res.send("New course(s) added.")
})

//Add new courses
exports.courseinstance_create_get = function (req, res) {
    res.send('New course added!')
}

//Delete courses
exports.courseinstance_delete_get = function (req, res) {
    res.send('Course deleted!')
}

module.exports = router