import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Footer from '../../components/students/Footer';
import { assets } from '../../assets/assets';

const Cart = () => {
  const { backendUrl, currency, getToken, navigate, fetchUserCart } = useContext(AppContext);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(backendUrl + '/api/cart/get', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (data.success) {
        setCart(data.cart);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (courseId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + '/api/cart/remove',
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        setCart(data.cart);
        fetchUserCart(); // Update cart count in navbar
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const clearCart = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + '/api/cart/clear',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        setCart(data.cart);
        fetchUserCart(); // Update cart count in navbar
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const checkout = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + '/api/cart/checkout',
        {},
        { headers: { Authorization: `Bearer ${token}`, origin: window.location.origin } }
      );
      
      if (data.success) {
        window.location.href = data.session_url;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    
    return cart.items.reduce((total, item) => {
      const course = item.courseId;
      const price = course.coursePrice - (course.discount * course.coursePrice / 100);
      return total + price;
    }, 0).toFixed(2);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='w-16 aspect-square border-4 border-gray-300 border-t-4 border-t-blue-400 rounded-full animate-spin'></div>
      </div>
    );
  }

  return (
    <>
      <div className='min-h-screen md:px-36 px-8 pt-20 pb-10'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold'>Shopping Cart</h1>
          {cart && cart.items.length > 0 && (
            <button
              onClick={clearCart}
              className='text-red-600 hover:text-red-700 text-sm'
            >
              Clear Cart
            </button>
          )}
        </div>

        {!cart || cart.items.length === 0 ? (
          <div className='text-center py-20'>
            <img src={assets.cart_icon || assets.logo} alt="Empty cart" className='w-32 mx-auto mb-4 opacity-50' />
            <h2 className='text-2xl font-semibold mb-2'>Your cart is empty</h2>
            <p className='text-gray-500 mb-6'>Browse courses and add them to your cart</p>
            <button
              onClick={() => navigate('/course-list')}
              className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700'
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className='grid md:grid-cols-3 gap-8'>
            <div className='md:col-span-2 space-y-4'>
              {cart.items.map((item) => {
                const course = item.courseId;
                const price = (course.coursePrice - (course.discount * course.coursePrice / 100)).toFixed(2);
                
                return (
                  <div key={course._id} className='border rounded-lg p-4 flex gap-4'>
                    <img
                      src={course.courseThumbnail}
                      alt={course.courseTitle}
                      className='w-32 h-20 object-cover rounded'
                    />
                    <div className='flex-1'>
                      <h3 className='font-semibold text-lg'>{course.courseTitle}</h3>
                      <p className='text-gray-600 text-sm line-clamp-2'>{course.courseDescription}</p>
                      <div className='flex justify-between items-center mt-2'>
                        <p className='text-lg font-bold'>{currency}{price}</p>
                        <button
                          onClick={() => removeFromCart(course._id)}
                          className='text-red-600 hover:text-red-700 text-sm'
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className='md:col-span-1'>
              <div className='border rounded-lg p-6 sticky top-20'>
                <h2 className='text-xl font-bold mb-4'>Order Summary</h2>
                <div className='space-y-2 mb-4'>
                  <div className='flex justify-between'>
                    <span>Items ({cart.items.length})</span>
                    <span>{currency}{calculateTotal()}</span>
                  </div>
                  <div className='border-t pt-2 flex justify-between font-bold text-lg'>
                    <span>Total</span>
                    <span>{currency}{calculateTotal()}</span>
                  </div>
                </div>
                <button
                  onClick={checkout}
                  className='w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold'
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={() => navigate('/course-list')}
                  className='w-full mt-3 border border-gray-300 py-3 rounded-lg hover:bg-gray-50'
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Cart;
