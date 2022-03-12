const User = require('../models/userModel')
const authController = require('../controllers/authController')
const AppError = require('../utils/appError') 

let users

// Controller function to get all users
exports.getAllUsers = common.getAll(User, users, true)

// Controller function to get single user
const getUser = ((req, res) => {
    const id = Number(req.params.userID)
    const user = Users.find(user => user.id === id)

    if (!user) {
        return res.status(404).send('User not found')
    }
    res.json(user)
})

// Controller function to update user data
const updateUser = ((req, res) => {
    const id = Number(req.params.userID)
    const index = users.findIndex(user => user.id === id)
    const updateUser = {
        name: req.body.name,
        image: req.body.image
    }
})

// Controller function to delete user data
