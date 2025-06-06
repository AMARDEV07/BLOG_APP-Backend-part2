import express from "express";
import {getPosts,getPost,createPost,deletePost,uploadAuth,featurePost} from "../controllers/post.controllers.js"
import increaseVisit from "../middlewares/increaseVisit.js";
const router = express.Router();




//creating routes for video /images uplode 
router.get("/upload-auth",uploadAuth)

//call for api controller function ...
router.get("/",getPosts);
router.get("/:slug",increaseVisit,getPost);
router.post("/",createPost);
router.delete("/:id",deletePost);
router.patch("/feature",featurePost);
// ai




export default router;
