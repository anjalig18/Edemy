import React from 'react'
import { Route, Routes ,useMatch} from 'react-router-dom'
import Home from './pages/student/Home'
import CoursesList from './pages/student/CoursesList'
import CourseDetails from './pages/student/CourseDetails'
import MyEnrollments from './pages/student/MyEnrollments'
import Player from './pages/student/Player'
import Cart from './pages/student/Cart'
import Loading from './components/students/Loading.jsx'
import Educator from './pages/educator/Educator'
import Dashboard from './pages/educator/Dashboard'
import AddCourse from './pages/educator/AddCourse'
import MyCourses from './pages/educator/MyCourses'
import StudentsEnrolled from './pages/educator/StudentEnrolled'
import EditCourse from './pages/educator/EditCourse'
import AdminDashboard from './pages/admin/AdminDashboard'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import SSOCallback from './pages/SSOCallback'
import Navbar from './components/students/Navbar.jsx'
import "quill/dist/quill.snow.css"
import {ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  const isEducatorRoute = useMatch('/educator/*')
  const isSignInRoute = useMatch('/sign-in')
  const isSignUpRoute = useMatch('/sign-up')
  const isSSOCallbackRoute = useMatch('/sso-callback')
  const isAuthRoute = isSignInRoute || isSignUpRoute || isSSOCallbackRoute
  
  return (
    <div className='text-default min-h-screen bg-white'>
      <ToastContainer position="top-right" autoClose={3000} />
      {!isEducatorRoute && !isAuthRoute && <Navbar />}
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/sign-up' element={<SignUp/>}/>
        <Route path='/sign-in' element={<SignIn/>}/>
        <Route path='/sso-callback' element={<SSOCallback/>}/>
        <Route path='/course-list' element={<CoursesList/>}/>
        <Route path='/course-list/:input' element={<CoursesList/>}/>
        <Route path='/course/:id' element={<CourseDetails/>}/>
        <Route path='/my-enrollments' element={<MyEnrollments/>}/>
        <Route path='/cart' element={<Cart/>}/>
        <Route path='/player/:courseId' element={<Player/>}/>
        <Route path='/loading/:path' element={<Loading/>}/>
        <Route path='/admin' element={<AdminDashboard/>}/>
        <Route path='/educator' element={<Educator/>}>
        <Route path='/educator' element={<Dashboard/>}/>
           <Route path='add-course' element={<AddCourse/>}/>
           <Route path='my-courses' element={<MyCourses/>}/>
           <Route path='edit-course/:id' element={<EditCourse/>}/>
           <Route path='student-enrolled' element={<StudentsEnrolled/>}/>
        </Route>
      </Routes>
    </div>
  )
}

export default App