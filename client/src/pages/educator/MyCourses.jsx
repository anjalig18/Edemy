import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../../components/students/Loading'

const MyCourses = () => {

  const {currency, backendUrl, getToken} = useContext(AppContext)
  const [courses, setCourses] = useState(null)
  const navigate = useNavigate()

  const fetchEducatorCourses = async () => {
    try {
      const token = await getToken()
      const {data} = await axios.get(backendUrl + '/api/educator/courses', {
        headers: {Authorization: `Bearer ${token}`}
      })
      if(data.success){
        setCourses(data.courses)
      } else {
        toast.error(data.message)
      }
    } catch(error) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (courseId) => {
    if(!confirm('Are you sure you want to delete this course?')) return
    
    try {
      const token = await getToken()
      const {data} = await axios.post(
        backendUrl + '/api/educator/delete-course',
        {courseId},
        {headers: {Authorization: `Bearer ${token}`}}
      )
      if(data.success){
        toast.success(data.message)
        fetchEducatorCourses()
      } else {
        toast.error(data.message)
      }
    } catch(error) {
      toast.error(error.message)
    }
  }

  useEffect(()=>{
   fetchEducatorCourses()
  },[])

  return courses ? (
    <div className='h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'> 
      <div className='w-full'>
        <h2 className='pb-4 text-lg font-medium'>My Courses</h2>
        <div className='flex flex-col items-center max-w-full w-full overflow-x-auto rounded-md bg-white border border-gray-500/20'>
          <table className='w-full'>
            <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Course</th>
              <th className="px-4 py-3 font-semibold">Earnings</th>
              <th className="px-4 py-3 font-semibold">Students</th>
              <th className="px-4 py-3 font-semibold">Published</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {courses.map((course)=> (
                <tr key={course._id} className="border-b border-gray-500/20">
                 <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <img src={course.courseThumbnail} alt="Course" className='w-16 h-10 object-cover rounded' />
                    <span className="max-w-xs truncate">{course.courseTitle}</span>
                  </div>
                 </td>
                 <td className="px-4 py-3">{currency}
                   {Math.floor((course.enrolledStudents?.length || 0) * (course.coursePrice - course.discount * course.coursePrice /100))}
                 </td>
                 <td className="px-4 py-3">{course.enrolledStudents?.length || 0}</td>
                 <td className="px-4 py-3">
                  {new Date(course.createdAt).toLocaleDateString()}
                 </td>
                 <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate(`/educator/edit-course/${course._id}`)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(course._id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                 </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : <Loading/>
}

export default MyCourses