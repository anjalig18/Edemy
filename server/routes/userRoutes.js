import express from 'express'
import { addUserRating, getUserCourseProgress, getUserData, loginUser, purchaseCourse, updateUserCourseProgress, userEnrolledCourses } from '../controllers/userController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const userRouter = express.Router()

// Public route - no auth required
userRouter.post('/login', loginUser)

// Protected routes - auth required
userRouter.get('/data', authMiddleware, getUserData)
userRouter.get('/enrolled-courses', authMiddleware, userEnrolledCourses)
userRouter.post('/purchase', authMiddleware, purchaseCourse)
userRouter.post('/update-course-progress', authMiddleware, updateUserCourseProgress)
userRouter.post('/get-course-progress', authMiddleware, getUserCourseProgress)
userRouter.post('/add-rating', authMiddleware, addUserRating)



export default userRouter;