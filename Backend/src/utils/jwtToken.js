import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/serverConfig.js';

export const generateJwtToken = (userId) => {
    const token = jwt.sign({ userId }, JWT_SECRET, {expiresIn: "1d"}); 
    return token;
};