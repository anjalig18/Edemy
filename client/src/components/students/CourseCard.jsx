import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import {Link} from 'react-router-dom'

const CourseCard = ({course}) => {
  const {currency , calculateRating} = useContext(AppContext);
  
  // Handle educator name safely
  const educatorName = course.educator && typeof course.educator === 'object' && course.educator.name 
    ? course.educator.name 
    : 'Instructor';
  
  return (
    <Link to={'/course/' + course._id} onClick={()=> scrollTo(0,0)} className='border border-gray-500/30 overflow-hidden rounded-lg flex flex-col h-full'>
      <div className='aspect-video w-full overflow-hidden'>
        <img className='w-full h-full object-cover' src={course.courseThumbnail} alt="" />
      </div>
      <div className='p-3 text-left flex flex-col flex-grow'>
        <h3 className='text-base font-semibold line-clamp-2 min-h-[3rem]'>{course.courseTitle}</h3>
        <p className='text-gray-500 text-sm mt-1'>{educatorName}</p>
        <div className='flex items-center space-x-2 mt-2'>
          <p className='font-semibold'>{calculateRating(course)}</p>
          <div className='flex'>
            {[...Array(5)].map((_,i)=>(<img key={i} src={i < Math.floor(calculateRating(course)) ? assets.star : assets.star_blank}  alt=''className='w-3.5 h-3.5'/>
            ))}
          </div>
          <p className='text-gray-500 text-sm'>({course.courseRatings.length})</p>
        </div>
        <p className='text-base font-semibold text-gray-800 mt-auto pt-2'>{currency}{(course.coursePrice - course.discount * course.coursePrice /100).toFixed(2)}</p>
      </div>
      </Link>
  )
}

export default CourseCard