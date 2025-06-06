import express from "express"
import { getUserSavedPosts, savePost } from "../controllers/user.controller.js"
const router=express.Router()







// get user save post
router.get("/saved", getUserSavedPosts)

// Patch method use kar rahe hain kyunki hum sirf user ke saved posts ke array ko update kar rahe hain
router.patch("/save", savePost)




export default router