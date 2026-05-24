import React, { useState, useEffect } from 'react';
import { useSignUp, useClerk, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { signOut } = useClerk();
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState(false);

  // Set timeout for Clerk loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoaded) {
        setLoadTimeout(true);
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timer);
  }, [isLoaded]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGoogleSignUp = async () => {
    if (!isLoaded) {
      toast.error('Please wait, loading...');
      return;
    }

    setLoading(true);
    try {
      // Use popup instead of redirect for better UX
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/'
      });
    } catch (err) {
      console.error('Google sign up error:', err);
      
      // If user is already signed in, sign them out and show message
      if (err.errors?.[0]?.message?.includes('already signed in') || err.errors?.[0]?.code === 'session_exists') {
        toast.info('Please sign out first to create a new account');
        setLoading(false);
        return;
      }
      
      toast.error(err.errors?.[0]?.message || 'Google sign up failed');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoaded) {
      toast.error('Please wait, loading...');
      return;
    }

    setLoading(true);
    try {
      await signUp.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailAddress: formData.email,
        password: formData.password,
        unsafeMetadata: {
          role: formData.role
        }
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setVerifying(true);
      toast.success('Verification code sent to your email!');
    } catch (err) {
      console.error('Sign up error:', err);
      toast.error(err.errors?.[0]?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!isLoaded) {
      toast.error('Please wait, loading...');
      return;
    }

    setLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        
        // Update public metadata with role
        toast.success('Account created successfully!');
        
        // Redirect based on role
        if (formData.role === 'teacher') {
          navigate('/educator');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Verification error:', err);
      toast.error(err.errors?.[0]?.message || 'Verification failed');
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50'>
        <div className='text-center'>
          <div className='w-16 aspect-square border-4 border-gray-300 border-t-4 border-t-blue-400 rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600 mb-2'>Loading authentication...</p>
          {loadTimeout && (
            <div className='mt-4'>
              <p className='text-sm text-red-600 mb-2'>Taking longer than expected</p>
              <button
                onClick={() => window.location.reload()}
                className='text-blue-600 hover:text-blue-700 text-sm underline'
              >
                Refresh page
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50 px-4'>
      <div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8'>
        {/* Logo */}
        <div className='text-center mb-8'>
          <img src={assets.logo} alt='Edemy' className='w-32 mx-auto mb-4' />
          <h1 className='text-3xl font-bold text-gray-800'>Create Account</h1>
          <p className='text-gray-600 mt-2'>Join Edemy and start learning today</p>
        </div>

        {!verifying ? (
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Google Sign Up Button */}
            <button
              type='button'
              onClick={handleGoogleSignUp}
              disabled={loading || !isLoaded}
              className='w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <svg className='w-5 h-5' viewBox='0 0 24 24'>
                <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/>
                <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/>
                <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/>
                <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/>
              </svg>
              {loading ? 'Redirecting...' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300'></div>
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-2 bg-white text-gray-500'>Or sign up with email</span>
              </div>
            </div>

            {/* First Name */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                First Name *
              </label>
              <input
                type='text'
                name='firstName'
                value={formData.firstName}
                onChange={handleChange}
                required
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='John'
              />
            </div>

            {/* Last Name */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Last Name *
              </label>
              <input
                type='text'
                name='lastName'
                value={formData.lastName}
                onChange={handleChange}
                required
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Doe'
              />
            </div>

            {/* Email */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Email Address *
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
                Password *
              </label>
              <input
                type='password'
                name='password'
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='••••••••'
              />
              <p className='text-xs text-gray-500 mt-1'>Minimum 8 characters</p>
            </div>

            {/* Role Selection */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                I want to join as *
              </label>
              <select
                name='role'
                value={formData.role}
                onChange={handleChange}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='student'>Student - Learn from courses</option>
                <option value='teacher'>Teacher - Create and teach courses</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={loading}
              className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* Sign In Link */}
            <p className='text-center text-sm text-gray-600'>
              Already have an account?{' '}
              <button
                type='button'
                onClick={() => navigate('/sign-in')}
                className='text-blue-600 hover:text-blue-700 font-medium'
              >
                Sign In
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerify} className='space-y-4'>
            <div className='text-center mb-6'>
              <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg className='w-8 h-8 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                </svg>
              </div>
              <h2 className='text-2xl font-bold text-gray-800'>Verify Your Email</h2>
              <p className='text-gray-600 mt-2'>
                We sent a verification code to<br />
                <span className='font-medium text-gray-800'>{formData.email}</span>
              </p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Verification Code *
              </label>
              <input
                type='text'
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest'
                placeholder='000000'
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            <button
              type='button'
              onClick={() => setVerifying(false)}
              className='w-full text-gray-600 py-2 text-sm hover:text-gray-800'
            >
              ← Back to sign up
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignUp;
