import React from 'react';
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const SSOCallback = () => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50'>
      <div className='text-center'>
        <div className='w-16 aspect-square border-4 border-gray-300 border-t-4 border-t-blue-400 rounded-full animate-spin mx-auto mb-4'></div>
        <p className='text-gray-600'>Completing sign in...</p>
      </div>
      <AuthenticateWithRedirectCallback
        afterSignInUrl='/'
        afterSignUpUrl='/'
        redirectUrl='/'
      />
    </div>
  );
};

export default SSOCallback;
