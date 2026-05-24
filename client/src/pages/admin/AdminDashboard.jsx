import React, { useContext, useEffect, useState, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { backendUrl, getToken, currency } = useContext(AppContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');

  // Check if user is admin (MongoDB login) - memoized to prevent infinite loop
  const mongoUser = useMemo(() => {
    const userToken = localStorage.getItem('userToken');
    const storedUserData = localStorage.getItem('userData');
    return userToken && storedUserData ? JSON.parse(storedUserData) : null;
  }, []);

  useEffect(() => {
    if (mongoUser && mongoUser.role !== 'admin') {
      toast.error('Unauthorized access');
      navigate('/');
    }
  }, [mongoUser, navigate]);

  const fetchStats = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(backendUrl + '/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(backendUrl + '/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(backendUrl + '/api/admin/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchPayments = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(backendUrl + '/api/admin/payments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setPayments(data.payments);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + '/api/admin/users/delete',
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchUsers();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + '/api/admin/users/update-role',
        { userId, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        setEditingUser(null);
        fetchUsers();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updateUserDetails = async (userId, name, email, role) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + '/api/admin/users/update',
        { userId, name, email, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        setEditingUser(null);
        fetchUsers();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setEditRole(user.role || 'student');
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditName('');
    setEditEmail('');
    setEditRole('');
  };

  const handleUpdateUser = () => {
    if (editingUser && editName && editEmail && editRole) {
      updateUserDetails(editingUser._id, editName, editEmail, editRole);
    } else {
      toast.error('Please fill all fields');
    }
  };

  const deleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + '/api/admin/courses/delete',
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchCourses();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchStats();
      if (activeTab === 'users') await fetchUsers();
      if (activeTab === 'courses') await fetchCourses();
      if (activeTab === 'payments') await fetchPayments();
      setLoading(false);
    };
    
    if (mongoUser && mongoUser.role === 'admin') {
      loadData();
    } else {
      setLoading(false);
    }
  }, [activeTab]); // Removed mongoUser from dependencies to prevent infinite loop

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='w-16 aspect-square border-4 border-gray-300 border-t-4 border-t-blue-400 rounded-full animate-spin'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-800'>Admin Dashboard</h1>
          <button onClick={() => navigate('/')} className='text-blue-600 hover:text-blue-700'>
            Back to Home
          </button>
        </div>

        {/* Tabs */}
        <div className='flex gap-4 mb-6 border-b'>
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-2 px-4 ${activeTab === 'stats' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-2 px-4 ${activeTab === 'courses' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            Courses
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-2 px-4 ${activeTab === 'payments' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            Payments
          </button>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <div className='bg-white p-6 rounded-lg shadow'>
              <h3 className='text-gray-600 text-sm mb-2'>Total Users</h3>
              <p className='text-3xl font-bold text-gray-800'>{stats.totalUsers}</p>
            </div>
            <div className='bg-white p-6 rounded-lg shadow'>
              <h3 className='text-gray-600 text-sm mb-2'>Total Courses</h3>
              <p className='text-3xl font-bold text-gray-800'>{stats.totalCourses}</p>
            </div>
            <div className='bg-white p-6 rounded-lg shadow'>
              <h3 className='text-gray-600 text-sm mb-2'>Total Payments</h3>
              <p className='text-3xl font-bold text-gray-800'>{stats.totalPayments}</p>
            </div>
            <div className='bg-white p-6 rounded-lg shadow'>
              <h3 className='text-gray-600 text-sm mb-2'>Total Revenue</h3>
              <p className='text-3xl font-bold text-gray-800'>{currency}{stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            <div className='bg-white rounded-lg shadow overflow-hidden'>
              <table className='w-full'>
                <thead className='bg-gray-100'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Name</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Email</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Role</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className='px-6 py-4 whitespace-nowrap'>{user.name}</td>
                      <td className='px-6 py-4 whitespace-nowrap'>{user.email}</td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm capitalize'>
                          {user.role || 'student'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex gap-2'>
                          <button
                            onClick={() => openEditModal(user)}
                            className='text-blue-600 hover:text-blue-700 text-sm'
                          >
                            Edit Role
                          </button>
                          <button
                            onClick={() => deleteUser(user._id)}
                            className='text-red-600 hover:text-red-700 text-sm'
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
              <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                <div className='bg-white rounded-lg p-6 w-96'>
                  <h2 className='text-xl font-bold mb-4'>Edit User Details</h2>
                  <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Name</label>
                    <input
                      type='text'
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className='w-full border rounded px-3 py-2'
                      placeholder='Enter name'
                    />
                  </div>
                  <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Email</label>
                    <input
                      type='email'
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className='w-full border rounded px-3 py-2'
                      placeholder='Enter email'
                    />
                  </div>
                  <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2'>Role</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className='w-full border rounded px-3 py-2'
                    >
                      <option value='student'>Student</option>
                      <option value='teacher'>Teacher</option>
                      <option value='admin'>Admin</option>
                    </select>
                  </div>
                  <div className='flex gap-2 justify-end'>
                    <button
                      onClick={closeEditModal}
                      className='px-4 py-2 border rounded hover:bg-gray-100'
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateUser}
                      className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
                    >
                      Update User
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className='bg-white rounded-lg shadow overflow-hidden'>
            <div className='px-6 py-4 border-b flex justify-between items-center'>
              <h2 className='text-lg font-semibold'>All Courses</h2>
              <button
                onClick={() => navigate('/educator/add-course')}
                className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
              >
                + Add Course
              </button>
            </div>
            <table className='w-full'>
              <thead className='bg-gray-100'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Title</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Educator</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Price</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Enrolled</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {courses.map((course) => (
                  <tr key={course._id}>
                    <td className='px-6 py-4'>{course.courseTitle}</td>
                    <td className='px-6 py-4'>{course.educator?.name || 'N/A'}</td>
                    <td className='px-6 py-4'>{currency}{course.coursePrice}</td>
                    <td className='px-6 py-4'>{course.enrolledStudents?.length || 0}</td>
                    <td className='px-6 py-4'>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => navigate(`/educator/edit-course/${course._id}`)}
                          className='text-blue-600 hover:text-blue-700'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCourse(course._id)}
                          className='text-red-600 hover:text-red-700'
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
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className='bg-white rounded-lg shadow overflow-hidden'>
            <table className='w-full'>
              <thead className='bg-gray-100'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>User</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Course</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Amount</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Status</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Date</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td className='px-6 py-4'>{payment.userId?.name || 'N/A'}</td>
                    <td className='px-6 py-4'>{payment.courseId?.courseTitle || 'N/A'}</td>
                    <td className='px-6 py-4'>{currency}{payment.amount?.toFixed(2)}</td>
                    <td className='px-6 py-4'>
                      <span className={`px-2 py-1 rounded text-xs ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className='px-6 py-4'>{new Date(payment.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
