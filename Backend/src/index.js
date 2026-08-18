import express from "express";
import { FRONTEND_URL, SERVER_PORT } from "./config/serverConfig.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dbConfig from "./config/dbConfig.js";
import apiRouter from "./routes/apiRoutes.js";

// Initialize Express app

const app = express();

// Middleware

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: "https://up-gear-test.vercel.app",
    // origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
}));

// Test route

app.get("/hello", (_, res) => {
    return res.json({ message: "Hello World!" });
});

// Main route

app.use('/api', apiRouter);

// Start the server

app.listen(SERVER_PORT, () => {
    console.log(`Server is running on port ${SERVER_PORT}`);
    dbConfig();
})