import { clerkClient } from "@clerk/express";

// Middleware to protect admin routes
export const protectAdmin = async (req, res, next) => {
    try {
        const userId = req.auth.userId;
        
        // Check if role is already set (from MongoDB JWT)
        if (req.auth.role) {
            if (req.auth.role !== 'admin') {
                return res.json({ success: false, message: 'Unauthorized - Admin access required' });
            }
            return next();
        }
        
        // Fallback to Clerk API
        const response = await clerkClient.users.getUser(userId);

        if (response.publicMetadata.role !== 'admin') {
            return res.json({ success: false, message: 'Unauthorized - Admin access required' });
        }
        
        next();
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
