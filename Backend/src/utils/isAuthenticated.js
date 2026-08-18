import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/serverConfig.js';

const isAuthenticated = (req, res, next) => {
    try {
        // console.log("Token from cookies:", req.headers.authorization?.split(" ")[1]); // Log the token for debugging
        const token = req.cookies.signinToken || req.headers.authorization?.split(" ")[1];

        console.log("Token from cookies:", token); // Log the token for debugging

        if(!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access",
            });
        };

        const decoded = jwt.verify(token, JWT_SECRET);

        console.log("Decoded token:", decoded); // Log the decoded token for debugging

        if(!decoded) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access",
            });
        };

        req.userId = decoded.userId;

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export default isAuthenticated;
