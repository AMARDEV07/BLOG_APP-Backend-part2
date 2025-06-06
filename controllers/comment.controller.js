import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";

//get comments and get comment id in single post list page

export const getPostComments = async (req, res) => {
  const comments = await Comment.find({
    post: req.params.postId,
  }) //searches the database for all comments wherepost id
    .populate("user", "username img") //comment show name img
    .sort({ createdAt: -1 }); //it show latest comment first

  res.json(comments);
};






//add-comment
export const addComment = async (req, res) => {
  //when we add comment firts they auth u
  const clerkUserId = req.auth.userId;
  const postId = req.params.postId; //requst kro is post id ka liay

  if (!clerkUserId) {
    return res.status(401).json("Not Authenticated!");
  }

  const user = await User.findOne({ clerkUserId }); //find kro user ko jiski id ya h

  //comment add
  const newComment = new Comment({
    ...req.body,
    user: user._id,
    post: postId,
  });

  const savedComment = await newComment.save();

  setTimeout(() => {
    res.status(201).json(savedComment);
  }, 3000);
};








// delete commanet
export const deleteComment = async (req, res) => {
  //when we add comment firts they auth u
  const clerkUserId = req.auth.userId;
  const id = req.params.id; //requst kro is post id ka liay

  if (!clerkUserId) {
    return res.status(401).json("Not Authenticated!");
  }

  

  //check usser role base auth cindition 
    //if role ha addmin ka toh find kro id sa or dekete kr do 
    const role=req.auth.sessionClaims?.metadata?.role|| "user"
    if(role==="admin"){
      await Comment.findByIdAndDelete(req.params.id);
       return res.status(200).json("comment has been deleeted");
  
    }

  const user = await User.findOne({ clerkUserId });
  const deletedComment = await Comment.findOneAndDelete({
    _id: id,
    user: user._id,
  });

  if (!deletedComment) {
    return res.status(403).json("you can delete only your comment");
  }

  res.status(200).json("comment deleted");
};
