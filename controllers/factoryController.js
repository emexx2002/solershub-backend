const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

exports.getAll = (Model, user, removeDisabled, options) => 
    catchAsync(async (req, res, next) => {
        if (options) {
            user = await Model.find().populate(options)
        } else {
            user = await Model.find()
        }
        const newUser = []
        if (removeDisabled) {
            user.map((el) => {
                if (el.active === true) {
                    newUser.push(el)
                }
            })
            return success (res, '200', newUser, true)
        }

        success (res, '200', newUser, true)
    })

exports.deleteUser = (Model, newUser) => 
    catchAsync(async (req, res, next) => {
        user = await Model.FindbyId(req.params.id)

        if (!user) {
            return next(new AppError("No user found with that id!", 404))
        }

        if (req.user.id == user.user || req.user.role == 'admin') {
            doc.deleteUser()
            return success (res, '204', user)
        } else {
            return next(
                new AppError(
                    "Unable to delete this user account as you are not the owner of this user account", 401
                )
            )
        }
    })
