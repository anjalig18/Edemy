import { clerkClient } from '@clerk/express'
import Course from '../models/Course.js'
import {v2 as cloudinary} from 'cloudinary'
import { Purchase } from '../models/Purchase.js'
import User from "../models/User.js"

// Add new Course
export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body
    const imageFile = req.file
    const educatorId = req.auth.userId

    if (!imageFile) {
      return res.json({ success: false, message: 'Thumbnail Not Attached' })
    }
    const parsedCourseData = JSON.parse(courseData)
    parsedCourseData.educator = educatorId
    const newCourse = await Course.create(parsedCourseData)
    const imageUpload = await cloudinary.uploader.upload(imageFile.path)
    newCourse.courseThumbnail = imageUpload.secure_url
    await newCourse.save()
    res.json({ success: true, message: 'Course Added' })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Get Educator Courses
export const getEducatorCourses = async (req, res) => {
  try {
    const educator = req.auth.userId
    const courses = await Course.find({ educator })
    res.json({ success: true, courses })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Get Educator Dashboard Data (Total Earnings, enrolled students)
export const educatorDashboardData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    const totalCourses = courses.length;

    // Fixed: was `courses.map(courses => Course._id)` — used Model instead of instance
    const courseIds = courses.map(course => course._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: 'completed'
    });
    const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

    const enrolledStudentsData = [];
    for (const course of courses) {
      // Fixed: was `course.enrolledStuents` (typo) → `course.enrolledStudents`
      const students = await User.find({
        _id: { $in: course.enrolledStudents }
      }, 'name imageUrl');
      students.forEach(student => {
        enrolledStudentsData.push({ courseTitle: course.courseTitle, student });
      });
    }

    res.json({ success: true, dashboardData: { totalEarnings, enrolledStudentsData, totalCourses } })
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

// Get Enrolled Students Data with Purchase Data
export const getEnrolledStudentsData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    const courseIds = courses.map(course => course._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: 'completed'
    }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle')

    // Fixed: renamed `purchaseData` → `purchaseDate` and fixed typo `enrolledStuents`
    const enrolledStudents = purchases.map(purchase => ({
      student: purchase.userId,
      courseTitle: purchase.courseId.courseTitle,
      purchaseDate: purchase.createdAt   // Fixed: was `purchaseData`
    }));
    res.json({ success: true, enrolledStudents })  // Fixed: was `enrolledStuents`
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

// Edit/Update Course
export const updateCourse = async (req, res) => {
  try {
    const { courseId, courseData } = req.body;
    const imageFile = req.file;
    const educatorId = req.auth.userId;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.json({ success: false, message: 'Course not found' });
    }
    if (course.educator.toString() !== educatorId) {
      return res.json({ success: false, message: 'Unauthorized' });
    }

    const parsedCourseData = JSON.parse(courseData);
    Object.keys(parsedCourseData).forEach(key => {
      course[key] = parsedCourseData[key];
    });

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path);
      course.courseThumbnail = imageUpload.secure_url;
    }

    await course.save();
    res.json({ success: true, message: 'Course updated successfully', course });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Delete Course
export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const educatorId = req.auth.userId;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.json({ success: false, message: 'Course not found' });
    }
    if (course.educator.toString() !== educatorId) {
      return res.json({ success: false, message: 'Unauthorized' });
    }

    await Course.findByIdAndDelete(courseId);
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
