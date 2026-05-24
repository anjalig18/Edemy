import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import axios from 'axios';

const SignIn = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Login via MongoDB backend
      const { data } = await axios.post(backendUrl + '/api/user/login', {
        email: formData.email,
        password: formData.password
      });

      if (data.success) {
        // Store user data and token in localStorage
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        toast.success('Welcome back!');
        
        // Redirect based on role
        const role = data.user.role;
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'teacher' || role === 'educator') {
          navigate('/educator');
        } else {
          navigate('/');
        }
        
        // Reload to update context
        window.location.reload();
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50 px-4'>
      <div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8'>
        {/* Logo */}
        <div className='text-center mb-8'>
          <img src={assets.logo} alt='Edemy' className='w-32 mx-auto mb-4' />
          <h1 className='text-3xl font-bold text-gray-800'>Welcome Back</h1>
          <p className='text-gray-600 mt-2'>Sign in to continue learning</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Email */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Email Address
            </label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              required
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='john@example.com'
            />
          </div>

          {/* Password */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Password
            </label>
            <input
              type='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              required
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='••••••••'
            />
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            disabled={loading}
            className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Sign Up Link */}
          <p className='text-center text-sm text-gray-600'>
            Don't have an account?{' '}
            <button
              type='button'
              onClick={() => navigate('/sign-up')}
              className='text-blue-600 hover:text-blue-700 font-medium'
            >
              Create Account
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
