import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react"
import axios from 'axios';
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const currency = import.meta.env.VITE_CURRENCY

  const navigate = useNavigate()

  const { getToken: getClerkToken } = useAuth()
  const { user } = useUser()

  // Unified getToken function that works for both Clerk and MongoDB login
  const getToken = async () => {
    // Check for MongoDB token first
    const mongoToken = localStorage.getItem('userToken');
    if (mongoToken) {
      return mongoToken;
    }
    // Fallback to Clerk token
    return await getClerkToken();
  };

  const [allCourses, setAllCourses] = useState([])
  const [isEducator, setIsEducator] = useState(false)
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [userData, setUserData] = useState(null)
  const [cartItems, setCartItems] = useState([])

  // Fetch all Courses
  const fetchAllCourses = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/course/all');
      if (data.success) {
        setAllCourses(data.courses)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Fetch UserData
  const fetchUserData = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const { data } = await axios.get(backendUrl + '/api/user/data', { headers: { Authorization: `Bearer ${token}` } })
      if (data.success) {
        setUserData(data.user)
      } else {
        console.log(data.message)
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  // Function to calculate average rating of course
  const calculateRating = (course) => {
    if (course.courseRatings.length === 0) return 0;
    let totalRating = 0
    course.courseRatings.forEach(rating => { totalRating += rating.rating })
    return Math.floor(totalRating / course.courseRatings.length)
  }

  // Function to calculate course chapter time
  const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent.map((lecture) => time += lecture.lectureDuration);
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  // Function to calculate course duration
  const calculateCourseDuration = (course) => {
    if (!course || !course.courseContent) return '0h 0m';
    let time = 0
    course.courseContent.map((chapter) => chapter.chapterContent.map(
      (lecture) => time += lecture.lectureDuration
    ))
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] })
  }

  // Function to calculate number of lectures in the course
  const calculateNoOfLectures = (course) => {
    if (!course || !course.courseContent) return 0;
    let totalLectures = 0
    course.courseContent.forEach(chapter => {
      if (Array.isArray(chapter.chapterContent)) {
        totalLectures += chapter.chapterContent.length
      }
    });
    return totalLectures;
  }

  // Fetch User Enrolled Courses
  const fetchUserEnrolledCourses = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const { data } = await axios.get(backendUrl + '/api/user/enrolled-courses', { headers: { Authorization: `Bearer ${token}` } })
      if (data.success) {
        setEnrolledCourses(data.enrolledCourses.reverse())
      } else {
        console.log(data.message)
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  // Fetch User Cart
  const fetchUserCart = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const { data } = await axios.get(backendUrl + '/api/cart/get', { headers: { Authorization: `Bearer ${token}` } })
      if (data.success) {
        setCartItems(data.cart.items || [])
      } else {
        console.log(data.message)
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  // Fetch public courses on mount (no auth needed)
  useEffect(() => {
    fetchAllCourses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch user-specific data only after user is confirmed logged in
  useEffect(() => {
    // Check for MongoDB-based login first
    const userToken = localStorage.getItem('userToken');
    const storedUser = localStorage.getItem('userData');
    
    if (userToken && storedUser) {
      // User logged in via MongoDB
      const userData = JSON.parse(storedUser);
      const role = userData.role;
      
      // Set educator flag
      if (role === 'educator' || role === 'teacher') {
        setIsEducator(true);
      }
      
      // Fetch user data for MongoDB users
      fetchUserData();
      fetchUserEnrolledCourses();
      fetchUserCart();
      
      // Don't auto-redirect if already on correct page
      const currentPath = window.location.pathname;
      if (currentPath === '/' || currentPath === '/sign-in' || currentPath === '/sign-up') {
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'educator' || role === 'teacher') {
          navigate('/educator');
        }
      }
      
      return; // Skip Clerk-based logic
    }
    
    // Fallback to Clerk-based login
    if (user) {
      // Fixed: only trust publicMetadata (set server-side) for role — not unsafeMetadata
      // unsafeMetadata can be written by any client and must never gate auth
      const role = user.publicMetadata?.role
      
      // Set educator flag
      if (role === 'educator' || role === 'teacher') {
        setIsEducator(true)
      }
      
      // Auto-redirect to appropriate dashboard on login
      const currentPath = window.location.pathname
      if (currentPath === '/' || currentPath === '/sign-in' || currentPath === '/sign-up') {
        if (role === 'admin') {
          navigate('/admin')
        } else if (role === 'educator' || role === 'teacher') {
          navigate('/educator')
        }
      }
      
      fetchUserData()
      fetchUserEnrolledCourses()
      fetchUserCart()
    } else {
      // User logged out — clear user-specific state
      setUserData(null)
      setEnrolledCourses([])
      setCartItems([])
      setIsEducator(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const value = {
    currency, allCourses, navigate, calculateRating, isEducator, setIsEducator,
    calculateNoOfLectures, calculateCourseDuration, calculateChapterTime,
    enrolledCourses, fetchUserEnrolledCourses,
    backendUrl, userData, setUserData, getToken, fetchAllCourses,
    cartItems, fetchUserCart
  }

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  )
}
