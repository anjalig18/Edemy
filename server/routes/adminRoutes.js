import express from 'express';
import { protectAdmin } from '../middlewares/adminMiddleware.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
    getAllUsers,
    deleteUser,
    updateUserRole,
    updateUser,
    getAllCourses,
    deleteCourse,
    getAllPayments,
    getPlatformStats
} from '../controllers/adminController.js';

const adminRouter = express.Router();

// User management
adminRouter.get('/users', authMiddleware, protectAdmin, getAllUsers);
adminRouter.post('/users/delete', authMiddleware, protectAdmin, deleteUser);
adminRouter.post('/users/update-role', authMiddleware, protectAdmin, updateUserRole);
adminRouter.post('/users/update', authMiddleware, protectAdmin, updateUser);

// Course management
adminRouter.get('/courses', authMiddleware, protectAdmin, getAllCourses);
adminRouter.post('/courses/delete', authMiddleware, protectAdmin, deleteCourse);

// Payment management
adminRouter.get('/payments', authMiddleware, protectAdmin, getAllPayments);

// Platform statistics
adminRouter.get('/stats', authMiddleware, protectAdmin, getPlatformStats);

export default adminRouter;
