import User from '../models/User.js';
import Course from '../models/Course.js';
import { Purchase } from '../models/Purchase.js';
import { clerkClient } from '@clerk/express';

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-__v');
        res.json({ success: true, users });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.body;
        
        // Delete from MongoDB
        await User.findByIdAndDelete(userId);
        
        // Delete from Clerk
        await clerkClient.users.deleteUser(userId);
        
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update user role
export const updateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        
        if (!['student', 'teacher', 'admin'].includes(role)) {
            return res.json({ success: false, message: 'Invalid role' });
        }
        
        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: { role }
        });
        
        res.json({ success: true, message: 'User role updated successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update user details (name, email, role)
export const updateUser = async (req, res) => {
    try {
        const { userId, name, email, role } = req.body;
        
        if (!['student', 'teacher', 'admin'].includes(role)) {
            return res.json({ success: false, message: 'Invalid role' });
        }
        
        // Update in MongoDB
        await User.findByIdAndUpdate(userId, { name, email });
        
        // Update in Clerk (if user exists in Clerk)
        try {
            await clerkClient.users.updateUser(userId, {
                firstName: name.split(' ')[0],
                lastName: name.split(' ').slice(1).join(' ') || '',
            });
            
            await clerkClient.users.updateUserMetadata(userId, {
                publicMetadata: { role }
            });
        } catch (clerkError) {
            console.log('Clerk update skipped (user may not exist in Clerk)');
        }
        
        res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get all courses (admin view)
export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate('educator', 'name email');
        res.json({ success: true, courses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete any course
export const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        
        await Course.findByIdAndDelete(courseId);
        
        res.json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get all payments
export const getAllPayments = async (req, res) => {
    try {
        const payments = await Purchase.find()
            .populate('userId', 'name email')
            .populate('courseId', 'courseTitle')
            .sort({ createdAt: -1 });
        
        res.json({ success: true, payments });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get platform statistics
export const getPlatformStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCourses = await Course.countDocuments();
        const totalPayments = await Purchase.countDocuments({ status: 'completed' });
        
        const totalRevenue = await Purchase.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        res.json({
            success: true,
            stats: {
                totalUsers,
                totalCourses,
                totalPayments,
                totalRevenue: totalRevenue[0]?.total || 0
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
