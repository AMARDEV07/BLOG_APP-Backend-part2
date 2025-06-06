import express from "express";
import dotenv from "dotenv";
import connectDB from "./lib/connectDB.js";
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import webhooksRouter from "./routes/webhook.route.js";

import { clerkMiddleware } from "@clerk/express";
import cors from 'cors';



// Load environment variables
dotenv.config();
const app = express();



// CORS configuration fix
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));




app.use("/webhooks", webhooksRouter);
app.use(express.json());



// Clerk auth middleware for protected routes
app.use(clerkMiddleware());




// Upload auth by imagekit middleware for upload/photo video auth
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});






// API call routes 
app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);





// Middleware for error handling
app.use((error, req, res, next) => {
  console.error("Error:", error); // Add logging
  res.status(error.status || 500);
  res.json({
    message: error.message || "something wrong",
    status: error.status,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
});






app.listen(3000, async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");
    console.log("Server is running on port 3000");
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
});