import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { assets } from '../../assets/assets';

const EditCourse = () => {
  const { id } = useParams();
  const { backendUrl, getToken } = useContext(AppContext);
  const navigate = useNavigate();

  // Get MongoDB user
  const mongoUser = useMemo(() => {
    const userToken = localStorage.getItem('userToken');
    const storedUserData = localStorage.getItem('userData');
    return userToken && storedUserData ? JSON.parse(storedUserData) : null;
  }, []);

  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [coursePrice, setCoursePrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [courseThumbnail, setCourseThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [courseContent, setCourseContent] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourse = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/course/' + id);
      if (data.success) {
        const course = data.courseData;
        
        // Check if user owns this course (for MongoDB users, check against _id)
        if (mongoUser) {
          const isAdmin = mongoUser.role === 'admin';
          const isOwner = course.educator._id === mongoUser._id || course.educator === mongoUser._id;
          
          if (!isOwner && !isAdmin) {
            toast.error('Unauthorized');
            navigate('/educator/my-courses');
            return;
          }
        }

        setCourseTitle(course.courseTitle);
        setCourseDescription(course.courseDescription);
        setCoursePrice(course.coursePrice);
        setDiscount(course.discount);
        setThumbnailPreview(course.courseThumbnail);
        setCourseContent(course.courseContent || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourseThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const addChapter = () => {
    setCourseContent([
      ...courseContent,
      {
        chapterId: `ch${Date.now()}`,
        chapterOrder: courseContent.length + 1,
        chapterTitle: '',
        chapterContent: []
      }
    ]);
  };

  const removeChapter = (index) => {
    setCourseContent(courseContent.filter((_, i) => i !== index));
  };

  const updateChapter = (index, field, value) => {
    const updated = [...courseContent];
    updated[index][field] = value;
    setCourseContent(updated);
  };

  const addLecture = (chapterIndex) => {
    const updated = [...courseContent];
    updated[chapterIndex].chapterContent.push({
      lectureId: `lec${Date.now()}`,
      lectureOrder: updated[chapterIndex].chapterContent.length + 1,
      lectureTitle: '',
      lectureUrl: '',
      lectureDuration: 0,
      isPreviewFree: 0
    });
    setCourseContent(updated);
  };

  const removeLecture = (chapterIndex, lectureIndex) => {
    const updated = [...courseContent];
    updated[chapterIndex].chapterContent = updated[chapterIndex].chapterContent.filter((_, i) => i !== lectureIndex);
    setCourseContent(updated);
  };

  const updateLecture = (chapterIndex, lectureIndex, field, value) => {
    const updated = [...courseContent];
    updated[chapterIndex].chapterContent[lectureIndex][field] = value;
    setCourseContent(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!courseTitle || !courseDescription || !coursePrice) {
      return toast.error('Please fill all required fields');
    }

    try {
      const token = await getToken();
      const formData = new FormData();
      
      const courseData = {
        courseTitle,
        courseDescription,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent
      };

      formData.append('courseId', id);
      formData.append('courseData', JSON.stringify(courseData));
      
      if (courseThumbnail) {
        formData.append('image', courseThumbnail);
      }

      const { data } = await axios.post(
        backendUrl + '/api/educator/update-course',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        navigate('/educator/my-courses');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (mongoUser) {
      fetchCourse();
    }
  }, []);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='w-16 aspect-square border-4 border-gray-300 border-t-4 border-t-blue-400 rounded-full animate-spin'></div>
      </div>
    );
  }

  return (
    <div className='p-8'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-semibold'>Edit Course</h1>
        <button onClick={() => navigate('/educator/my-courses')} className='text-blue-600'>
          Back to My Courses
        </button>
      </div>

      <form onSubmit={handleSubmit} className='max-w-4xl'>
        {/* Course Title */}
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-2'>Course Title *</label>
          <input
            type='text'
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            className='w-full border rounded px-3 py-2'
            required
          />
        </div>

        {/* Course Description */}
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-2'>Course Description *</label>
          <ReactQuill
            value={courseDescription}
            onChange={setCourseDescription}
            className='bg-white'
          />
        </div>

        {/* Price and Discount */}
        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>Price *</label>
            <input
              type='number'
              value={coursePrice}
              onChange={(e) => setCoursePrice(e.target.value)}
              className='w-full border rounded px-3 py-2'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-2'>Discount (%)</label>
            <input
              type='number'
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className='w-full border rounded px-3 py-2'
              min='0'
              max='100'
            />
          </div>
        </div>

        {/* Thumbnail */}
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-2'>Course Thumbnail</label>
          {thumbnailPreview && (
            <img src={thumbnailPreview} alt='Thumbnail' className='w-48 h-32 object-cover rounded mb-2' />
          )}
          <input
            type='file'
            accept='image/*'
            onChange={handleThumbnailChange}
            className='w-full border rounded px-3 py-2'
          />
        </div>

        {/* Course Content */}
        <div className='mb-6'>
          <div className='flex justify-between items-center mb-4'>
            <label className='block text-sm font-medium'>Course Content</label>
            <button type='button' onClick={addChapter} className='bg-blue-600 text-white px-4 py-2 rounded'>
              Add Chapter
            </button>
          </div>

          {courseContent.map((chapter, chapterIndex) => (
            <div key={chapter.chapterId} className='border rounded p-4 mb-4'>
              <div className='flex justify-between items-center mb-3'>
                <input
                  type='text'
                  placeholder='Chapter Title'
                  value={chapter.chapterTitle}
                  onChange={(e) => updateChapter(chapterIndex, 'chapterTitle', e.target.value)}
                  className='flex-1 border rounded px-3 py-2 mr-2'
                />
                <button type='button' onClick={() => removeChapter(chapterIndex)} className='text-red-600'>
                  Remove Chapter
                </button>
              </div>

              <button type='button' onClick={() => addLecture(chapterIndex)} className='bg-gray-200 px-3 py-1 rounded text-sm mb-3'>
                Add Lecture
              </button>

              {chapter.chapterContent.map((lecture, lectureIndex) => (
                <div key={lecture.lectureId} className='bg-gray-50 p-3 rounded mb-2'>
                  <div className='grid grid-cols-2 gap-2 mb-2'>
                    <input
                      type='text'
                      placeholder='Lecture Title'
                      value={lecture.lectureTitle}
                      onChange={(e) => updateLecture(chapterIndex, lectureIndex, 'lectureTitle', e.target.value)}
                      className='border rounded px-2 py-1'
                    />
                    <input
                      type='text'
                      placeholder='Video URL'
                      value={lecture.lectureUrl}
                      onChange={(e) => updateLecture(chapterIndex, lectureIndex, 'lectureUrl', e.target.value)}
                      className='border rounded px-2 py-1'
                    />
                  </div>
                  <div className='grid grid-cols-3 gap-2'>
                    <input
                      type='number'
                      placeholder='Duration (min)'
                      value={lecture.lectureDuration}
                      onChange={(e) => updateLecture(chapterIndex, lectureIndex, 'lectureDuration', Number(e.target.value))}
                      className='border rounded px-2 py-1'
                    />
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={lecture.isPreviewFree === 1}
                        onChange={(e) => updateLecture(chapterIndex, lectureIndex, 'isPreviewFree', e.target.checked ? 1 : 0)}
                        className='mr-2'
                      />
                      Free Preview
                    </label>
                    <button type='button' onClick={() => removeLecture(chapterIndex, lectureIndex)} className='text-red-600 text-sm'>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <button type='submit' className='bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700'>
          Update Course
        </button>
      </form>
    </div>
  );
};

export default EditCourse;
