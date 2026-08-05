import dotenv from 'dotenv';

dotenv.config();

export const SERVER_PORT = process.env.PORT;
export const DATABASE_URL = process.env.DATABASE_URL;
export const DIRECT_URL = process.env.DIRECT_URL;
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
export const AWS_REGION = process.env.AWS_REGION;
export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
export const JWT_SECRET = process.env.JWT_SECRET;
export const FRONTEND_URL = process.env.FRONTEND_URL;