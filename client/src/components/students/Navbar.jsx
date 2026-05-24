import React, { useContext, useEffect, useRef } from 'react'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'
import { useClerk , UserButton , useUser} from '@clerk/clerk-react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Navbar = () => {
  
  const {navigate, isEducator , backendUrl, setIsEducator, getToken, cartItems = []} = useContext(AppContext)

  const isCourseListPage = location.pathname.includes('/course-list');
  const {openSignIn, signOut} = useClerk()
  const { user: clerkUser } = useUser()
  
  // Check for MongoDB-based login first
  const userToken = localStorage.getItem('userToken');
  const storedUserData = localStorage.getItem('userData');
  const mongoUser = userToken && storedUserData ? JSON.parse(storedUserData) : null;
  
  // Use MongoDB user if available, otherwise Clerk user
  const currentUser = mongoUser || clerkUser;
  const isAdmin = mongoUser ? mongoUser.role === 'admin' : (clerkUser?.publicMetadata?.role === 'admin');
  
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
  
  const goToEducatorDashboard = () => {
    if(isEducator){
      navigate('/educator')
    }
  }
  
  const handleAuthClick = () => {
    if (!currentUser) {
      navigate('/sign-up')
    }
  }
  
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
  }

  return (
    <div className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${isCourseListPage ? 'bg-white' : 'bg-cyan-100/70'}`}>
        <img onClick={()=>navigate('/')} src={assets.logo} alt="Logo" className='w-28 lg:w-32 cursor-pointer'/>
        <div className='hidden md:flex items-center gap-5 text-gray-500'>
          <div className='flex items-center gap-5'>
            {currentUser && <>
              {isAdmin && <Link to='/admin'>Admin Dashboard</Link>}
              {!isAdmin && !isEducator && isAdmin && <span>|</span>}
              {isEducator && <button onClick={goToEducatorDashboard}>Educator Dashboard</button>}
              {!isAdmin && !isEducator && isEducator && <span>|</span>}
              {!isAdmin && !isEducator && (
                <>
                  <Link to='/my-enrollments'>My Enrollments</Link>
                  <span>|</span>
                  <Link to='/cart' className='relative'>
                    🛒 Cart
                    {cartItems && cartItems.length > 0 && (
                      <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                        {cartItems.length}
                      </span>
                    )}
                  </Link>
                </>
              )}
             </>
             }
          </div>
          { currentUser ? (
            mongoUser ? (
              <div className='relative' ref={profileMenuRef}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className='flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 cursor-pointer'
                >
                  <img src={mongoUser.imageUrl || assets.user_icon} alt="Profile" className='w-8 h-8 rounded-full' />
                  <span className='text-sm font-medium'>{mongoUser.name}</span>
                </button>
                {showProfileMenu && (
                  <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[100]'>
                    <div className='px-4 py-2 border-b border-gray-200'>
                      <p className='text-sm font-medium text-gray-800'>{mongoUser.name}</p>
                      <p className='text-xs text-gray-500'>{mongoUser.email}</p>
                      <p className='text-xs text-blue-600 mt-1 capitalize'>{mongoUser.role}</p>
                    </div>
                    <button
                      type="button"
                      onMouseDown={handleLogout}
                      className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors font-medium'
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <UserButton/>
            )
          ) : (
            <button onClick={handleAuthClick} className='bg-blue-600 text-white px-5 py-2 rounded-full'>Create Account</button>
          )}
        </div>
        {/* For Phone Screens */}
        <div className='md:hidden flex items-center gap-2 sm:gap-5 text-gray-500'>
        <div className='flex items-center gap-1 sm:gap-2 max-sm:text-xs'>
        {currentUser && 
        <>
        {isAdmin && <Link to='/admin'>Admin</Link>}
        {isEducator && <button onClick={goToEducatorDashboard}>Educator Dashboard</button>}
        {!isAdmin && !isEducator && (
          <>
            {(isAdmin || isEducator) && <span>|</span>}
            <Link to='/my-enrollments'>My Enrollments</Link>
            <span>|</span>
            <Link to='/cart' className='relative'>
              🛒
              {cartItems && cartItems.length > 0 && (
                <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center'>
                  {cartItems.length}
                </span>
              )}
            </Link>
          </>
        )}
        </>
       }
        </div>
        {
          currentUser ? (
            mongoUser ? (
              <div className='relative' ref={profileMenuRef}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className='flex items-center cursor-pointer'
                >
                  <img src={mongoUser.imageUrl || assets.user_icon} alt="Profile" className='w-8 h-8 rounded-full' />
                </button>
                {showProfileMenu && (
                  <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[100]'>
                    <div className='px-4 py-2 border-b border-gray-200'>
                      <p className='text-sm font-medium text-gray-800'>{mongoUser.name}</p>
                      <p className='text-xs text-gray-500'>{mongoUser.email}</p>
                      <p className='text-xs text-blue-600 mt-1 capitalize'>{mongoUser.role}</p>
                    </div>
                    <button
                      type="button"
                      onMouseDown={handleLogout}
                      className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors font-medium'
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <UserButton/>
            )
          ) : (
            <button onClick={handleAuthClick}><img src={assets.user_icon} alt=""/></button>
          )
        }
        </div>
    </div>
  )
}

export default Navbar
