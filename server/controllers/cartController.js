import Cart from '../models/Cart.js';
import Course from '../models/Course.js';

// Get user's cart
export const getCart = async (req, res) => {
    try {
        const userId = req.auth.userId;
        
        let cart = await Cart.findOne({ userId }).populate('items.courseId');
        
        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }
        
        res.json({ success: true, cart });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Add course to cart
export const addToCart = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { courseId } = req.body;
        
        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.json({ success: false, message: 'Course not found' });
        }
        
        let cart = await Cart.findOne({ userId });
        
        if (!cart) {
            cart = await Cart.create({ userId, items: [{ courseId }] });
        } else {
            // Check if course already in cart
            const existingItem = cart.items.find(item => item.courseId.toString() === courseId);
            if (existingItem) {
                return res.json({ success: false, message: 'Course already in cart' });
            }
            
            cart.items.push({ courseId });
            await cart.save();
        }
        
        await cart.populate('items.courseId');
        res.json({ success: true, message: 'Course added to cart', cart });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Remove course from cart
export const removeFromCart = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { courseId } = req.body;
        
        const cart = await Cart.findOne({ userId });
        
        if (!cart) {
            return res.json({ success: false, message: 'Cart not found' });
        }
        
        cart.items = cart.items.filter(item => item.courseId.toString() !== courseId);
        await cart.save();
        await cart.populate('items.courseId');
        
        res.json({ success: true, message: 'Course removed from cart', cart });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Clear cart
export const clearCart = async (req, res) => {
    try {
        const userId = req.auth.userId;
        
        const cart = await Cart.findOne({ userId });
        
        if (!cart) {
            return res.json({ success: false, message: 'Cart not found' });
        }
        
        cart.items = [];
        await cart.save();
        
        res.json({ success: true, message: 'Cart cleared', cart });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Checkout cart (purchase all items)
export const checkoutCart = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { origin } = req.headers;
        
        const cart = await Cart.findOne({ userId }).populate('items.courseId');
        
        if (!cart || cart.items.length === 0) {
            return res.json({ success: false, message: 'Cart is empty' });
        }
        
        // Calculate total amount
        let totalAmount = 0;
        const lineItems = cart.items.map(item => {
            const course = item.courseId;
            const price = (course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2);
            totalAmount += parseFloat(price);
            
            return {
                price_data: {
                    currency: (process.env.CURRENCY || 'usd').toLowerCase(),
                    product_data: {
                        name: course.courseTitle
                    },
                    unit_amount: Math.floor(price * 100)
                },
                quantity: 1
            };
        });
        
        // Create Stripe session
        const Stripe = (await import('stripe')).default;
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
        
        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/cart`,
            line_items: lineItems,
            mode: 'payment',
            metadata: {
                userId,
                cartCheckout: 'true',
                courseIds: cart.items.map(item => item.courseId._id.toString()).join(',')
            }
        });
        
        res.json({ success: true, session_url: session.url });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
