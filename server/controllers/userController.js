import User from "../models/User.js"
import Stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";
import { courseProgress } from "../models/CourseProgress.js";
import jwt from 'jsonwebtoken';

// MongoDB-based login (bypasses Clerk for demo accounts)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user in MongoDB
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    // Demo password check (in production, use bcrypt)
    const demoPasswords = {
      'admin@edemy.dev': 'Admin@1234!',
      'sarah@edemy.dev': 'Teacher@1234!',
      'james@edemy.dev': 'Teacher@1234!',
      'priya@edemy.dev': 'Teacher@1234!',
      'alex@edemy.dev': 'Student@1234!',
      'maria@edemy.dev': 'Student@1234!',
      'chris@edemy.dev': 'Student@1234!',
      'emma@edemy.dev': 'Student@1234!',
      'luca@edemy.dev': 'Student@1234!',
      'yuki@edemy.dev': 'Student@1234!'
    };
    
    if (demoPasswords[email] !== password) {
      return res.json({ success: false, message: 'Invalid password' });
    }
    
    // Determine role based on email (fallback if Clerk API fails)
    let role = 'student';
    if (email === 'admin@edemy.dev') {
      role = 'admin';
    } else if (email.includes('sarah@') || email.includes('james@') || email.includes('priya@')) {
      role = 'teacher';
    }
    
    // Try to get role from Clerk API (optional, fallback to email-based role)
    try {
      const response = await fetch(`https://api.clerk.com/v1/users/${user._id}`, {
        headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` }
      });
      if (response.ok) {
        const clerkUser = await response.json();
        role = clerkUser.public_metadata?.role || role;
      }
    } catch (error) {
      console.log('Using fallback role determination');
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role },
      process.env.CLERK_SECRET_KEY,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
        role
      }
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Helper: fetch user from Clerk API and upsert into MongoDB
const syncUserFromClerk = async (userId) => {
  const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` }
  })
  const clerkUser = await response.json()
  const userData = {
    _id: userId,
    email: clerkUser.email_addresses?.[0]?.email_address ?? '',
    name: ((clerkUser.first_name ?? '') + ' ' + (clerkUser.last_name ?? '')).trim(),
    imageUrl: clerkUser.image_url ?? '',
  }
  return await User.findByIdAndUpdate(userId, userData, { upsert: true, new: true })
}

export const getUserData = async (req, res) => {
  try {
    const userId = req.auth.userId
    let user = await User.findById(userId)
    if (!user) {
      user = await syncUserFromClerk(userId)
    }
    res.json({ success: true, user })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Users Enrolled Courses With Lecture Links
export const userEnrolledCourses = async (req, res) => {
  try {
    const userId = req.auth.userId
    const userData = await User.findById(userId).populate('enrolledCourses')
    if (!userData) {
      return res.json({ success: false, message: 'User not found' })
    }
    res.json({ success: true, enrolledCourses: userData.enrolledCourses || [] })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Purchase Course
export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const { origin } = req.headers
    const userId = req.auth.userId
    let userData = await User.findById(userId)

    // Auto-create user if webhook missed them during signup
    if (!userData) {
      userData = await syncUserFromClerk(userId)
    }

    const courseData = await Course.findById(courseId)
    if (!courseData) {
      return res.json({ success: false, message: 'Course Not Found' })
    }

    // Prevent duplicate purchase
    if (userData.enrolledCourses.includes(courseId)) {
      return res.json({ success: false, message: 'Already enrolled in this course' })
    }

    const amount = (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)

    const newPurchase = await Purchase.create({
      courseId: courseData._id,
      userId,
      amount,
    })

    // Stripe Gateway
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
    const currency = (process.env.CURRENCY || 'usd').toLowerCase()

    const line_items = [{
      price_data: {
        currency,
        product_data: { name: courseData.courseTitle },
        unit_amount: Math.round(parseFloat(amount) * 100)  // Fixed: use Math.round on full decimal
      },
      quantity: 1
    }]

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}/`,
      line_items,
      mode: 'payment',
      metadata: { purchaseId: newPurchase._id.toString() }
    })

    res.json({ success: true, session_url: session.url })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

export const updateUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId
    const { courseId, lectureId } = req.body
    const progressData = await courseProgress.findOne({ userId, courseId })

    if (progressData) {
      if (progressData.lectureCompleted.includes(lectureId)) {
        return res.json({ success: true, message: 'Lecture Already Completed' })
      }
      progressData.lectureCompleted.push(lectureId)
      await progressData.save()
    } else {
      await courseProgress.create({ userId, courseId, lectureCompleted: [lectureId] })
    }
    res.json({ success: true, message: 'Progress Updated' })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Get user Course Progress
export const getUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId
    const { courseId } = req.body
    const progressData = await courseProgress.findOne({ userId, courseId })
    res.json({ success: true, progressData })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

// Add User Rating to course
export const addUserRating = async (req, res) => {  // Fixed: added (req, res) params
  const userId = req.auth.userId;
  const { courseId, rating } = req.body;

  if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
    return res.json({ success: false, message: 'Invalid Details' });
  }
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.json({ success: false, message: 'Course not found.' });
    }
    const user = await User.findById(userId);
    // Fixed: inverted logic — block users who have NOT enrolled
    if (!user || !user.enrolledCourses.includes(courseId)) {
      return res.json({ success: false, message: 'User has not purchased this course.' });
    }
    const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId)
    if (existingRatingIndex > -1) {
      course.courseRatings[existingRatingIndex].rating = rating;
    } else {
      course.courseRatings.push({ userId, rating });
    }
    await course.save();
    return res.json({ success: true, message: 'Rating added' })
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}
