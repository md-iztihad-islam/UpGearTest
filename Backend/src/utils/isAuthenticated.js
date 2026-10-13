import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/serverConfig.js';

// Accepts the employee token from the signinToken cookie or an
// "Authorization: Bearer <token>" header. Missing, expired or tampered
// tokens all get a 401 so the dashboard can send the user to sign in.
const isAuthenticated = (req, res, next) => {
    const token = req.cookies?.signinToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized access",
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        return next();
    } catch {
        return res.status(401).json({
            success: false,
            message: "Your session has expired, please sign in again",
        });
    }
};

export default isAuthenticated;
