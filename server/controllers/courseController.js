import Course from "../models/Course.js";

//Get All Courses
export const getAllCourse = async (req,res) =>{
  try{
    const courses = await Course.find({isPublished: true}).select(['-enrolledStudents']).populate({path:'educator'})

    res.json({success:true,courses})
  }catch(error){
    res.json({ success: false, message: error.message})
  }
}

//Get Course By ID
export const getCourseId = async (req,res)=>{
  const {id} = req.params
  try{
    const courseData = await Course.findById(id).populate({path:'educator'})
    
    if(!courseData){
      return res.json({ success: false, message: 'Course not found'})
    }

    // Deep clone to avoid mutating the mongoose document before sending
    const courseObj = courseData.toObject()
    
    courseObj.courseContent.forEach(chapter => {
      chapter.chapterContent.forEach(lecture => {
        if(!lecture.isPreviewFree){
          lecture.lectureUrl = "";
        }
      })
    })

    res.json({ success: true, courseData: courseObj})
  }catch(error){
    res.json({ success: false, message: error.message})
  }
}
