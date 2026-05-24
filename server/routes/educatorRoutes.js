import express from 'express';
import { addCourse, educatorDashboardData, getEducatorCourses, getEnrolledStudentsData, updateCourse, deleteCourse } from '../controllers/educatorController.js';
import upload from '../configs/multer.js';
import { authMiddleware, protectEducator } from '../middlewares/authMiddleware.js';

const educatorRouter = express.Router()

educatorRouter.post('/add-course', upload.single('image'), authMiddleware, protectEducator, addCourse)
educatorRouter.post('/update-course', upload.single('image'), authMiddleware, protectEducator, updateCourse)
educatorRouter.post('/delete-course', authMiddleware, protectEducator, deleteCourse)
educatorRouter.get('/courses', authMiddleware, protectEducator, getEducatorCourses)
educatorRouter.get('/dashboard', authMiddleware, protectEducator, educatorDashboardData)
educatorRouter.get('/enrolled-students', authMiddleware, protectEducator, getEnrolledStudentsData)


export default educatorRouter;