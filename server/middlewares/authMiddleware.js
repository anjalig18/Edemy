import { clerkClient } from "@clerk/express";
import jwt from 'jsonwebtoken';

// Custom auth middleware that handles both Clerk and MongoDB JWT
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Try Clerk auth from clerkMiddleware
      if (req.auth?.userId) {
        return next();
      }
      return res.json({ success: false, message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Try to decode as MongoDB JWT
    try {
      const decoded = jwt.verify(token, process.env.CLERK_SECRET_KEY);
      // Set auth object similar to Clerk
      req.auth = {
        userId: decoded.userId,
        role: decoded.role
      };
      return next();
    } catch (jwtError) {
      // If JWT verification fails, assume it's a Clerk token
      // Clerk middleware will handle it
      return next();
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Middleware (Protect Educator Routes)
export const protectEducator = async (req, res, next) => {
    try{
      const userId = req.auth.userId
      
      // Check if role is already set (from MongoDB JWT)
      if (req.auth.role) {
        if (req.auth.role !== 'educator' && req.auth.role !== 'teacher') {
          return res.json({success: false, message: 'Unauthorized - Teacher access required'})
        }
        return next();
      }
      
      // Fallback to Clerk API
      const response = await clerkClient.users.getUser(userId)

      // Accept both 'educator' and 'teacher' roles for backward compatibility
      if(response.publicMetadata.role !== 'educator' && response.publicMetadata.role !== 'teacher'){
        return res.json({success: false, message: 'Unauthorized - Teacher access required'})
      }
      
      next()

    }catch(error) {
      res.json({success:false, message: error.message})
    }
}