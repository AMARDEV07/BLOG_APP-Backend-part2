import express from "express"
import { addComment, deleteComment, getPostComments } from "../controllers/comment.controller.js"
const router=express.Router()


//comments routter...

router.get("/:postId",getPostComments)
router.post("/:postId",addComment)
router.delete("/:id",deleteComment)


export default router