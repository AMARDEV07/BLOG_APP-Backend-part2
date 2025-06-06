import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import { Webhook } from "svix";

export const clerkWebHooks = async (req, res) => {


  try {
    // Check webhook secret key from env
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      console.error("CLERK_WEBHOOK_SECRET is not set in environment variables");
      return res.status(500).json({
        message: "Webhook secret configuration error"
      });
    }





// adding data to db 
    const payload = req.body;
    const headers = req.headers;
    
    // Log incoming webhook for debugging
    console.log("Webhook received:", {
      type: "incoming",
      headers: Object.keys(headers),
      payloadType: typeof payload,
      payloadLength: payload ? payload.length : 0
    });
    
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;

    try {
      // Verify webhook signature
      evt = wh.verify(payload, headers);
      console.log("Webhook verified successfully:", evt.type);
    } catch (err) {
      console.error("Webhook verification failed:", err.message);
      return res.status(400).json({
        message: "Webhook verification failed",
        error: err.message
      });
    }







    // Handle user creation...
    if (evt.type === "user.created") {
      try {
        console.log("Creating user:", evt.data.id);
        
        // Check if user already exists
        const existingUser = await User.findOne({ clerkUserId: evt.data.id });
        if (existingUser) {
          console.log("User already exists:", evt.data.id);
          return res.status(200).json({
            message: "User already exists"
          });
        }

        const newUser = new User({
          clerkUserId: evt.data.id,
          username: evt.data.username || evt.data.email_addresses[0]?.email_address?.split('@')[0] || `user_${evt.data.id.slice(-8)}`,
          email: evt.data.email_addresses[0]?.email_address,
          img: evt.data.profile_img_url || evt.data.image_url,
        });

        const savedUser = await newUser.save();
        console.log("User created successfully:", savedUser._id);
        
        
        return res.status(200).json({
          message: "User created successfully",
          userId: savedUser._id
        });
        
      } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({
          message: "Failed to create user",
          error: error.message
        });
      }
    }







    // Handle user deletion
    if (evt.type === "user.deleted") {
      try {
        console.log("Deleting user:", evt.data.id);
        
        const deletedUser = await User.findOneAndDelete({
          clerkUserId: evt.data.id,
        });

        if (deletedUser) {
          // Delete associated posts and comments
          await Post.deleteMany({ user: deletedUser._id });
          await Comment.deleteMany({ user: deletedUser._id });
          console.log("User and associated data deleted successfully");
        } else {
          console.log("User not found for deletion:", evt.data.id);
        }

        return res.status(200).json({
          message: "User deletion processed"
        });

      } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({
          message: "Failed to delete user",
          error: error.message
        });
      }
    }






    
    // Handle other webhook events
    console.log("Unhandled webhook event:", evt.type);
    return res.status(200).json({
      message: "Webhook received but not processed",
      eventType: evt.type
    });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};