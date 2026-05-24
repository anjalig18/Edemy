import express from 'express';
import { getCart, addToCart, removeFromCart, clearCart, checkoutCart } from '../controllers/cartController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const cartRouter = express.Router();

cartRouter.get('/get', authMiddleware, getCart);
cartRouter.post('/add', authMiddleware, addToCart);
cartRouter.post('/remove', authMiddleware, removeFromCart);
cartRouter.post('/clear', authMiddleware, clearCart);
cartRouter.post('/checkout', authMiddleware, checkoutCart);

export default cartRouter;
