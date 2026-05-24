import React, { useRef, useEffect } from 'react'
import { assets } from '../../assets/assets'
import { UserButton, useClerk } from '@clerk/clerk-react'
import {Link, useNavigate} from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  
  // Check for MongoDB-based login
  const userToken = localStorage.getItem('userToken');
  const storedUserData = localStorage.getItem('userData');
  const mongoUser = userToken && storedUserData ? JSON.parse(storedUserData) : null;
  
  const currentUser = mongoUser;
  
  // Profile dropdown state
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const profileMenuRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Clear MongoDB session
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    
    // Sign out from Clerk if user is logged in via Clerk
    if (signOut) {
      signOut().catch((error) => {
        console.log('Clerk signOut not needed or failed:', error);
      });
    }
    
    // Redirect to home
    window.location.href = '/';
  };

  return (
    <div className='flex items-center justify-between px-4 md:px-8 border-b border-gray-500 py-3'>
      <Link to='/'>
        <img  src={assets.logo} alt="Logo" className="w-28 lg:w-32" />
      </Link>
      <div className="flex items-center gap-5 text-gray-500 relative">
        <p>Hi! {currentUser ? mongoUser.name : 'Developers'}</p>
        {currentUser ? (
          <div className='relative' ref={profileMenuRef}>
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className='flex items-center cursor-pointer'
            >
              <img 
                src={mongoUser.imageUrl || assets.profile_img} 
                alt="Profile" 
                className='w-10 h-10 rounded-full object-cover'
              />
            </button>
            {showProfileMenu && (
              <div className='absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[100]'>
                <div className='px-4 py-3 border-b border-gray-200'>
                  <p className='text-sm font-semibold text-gray-800'>{mongoUser.name}</p>
                  <p className='text-xs text-gray-500 mt-1'>{mongoUser.email}</p>
                  <p className='text-xs text-blue-600 mt-2 capitalize font-medium'>
                    Role: {mongoUser.role}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/educator/profile');
                  }}
                  className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium cursor-pointer'
                >
                  👤 Update Profile
                </button>
                <button
                  type="button"
                  onMouseDown={handleLogout}
                  className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium cursor-pointer'
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <img className='max-w-8' src={assets.profile_img} alt="Profile" />
        )}
      </div>
    </div>
  )
}

export default Navbar
