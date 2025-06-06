import Post from "../models/post.model.js"

const increaseVisit=async(req,res,next)=>{
    //request for post id;
    const slug=req.params.slug;

     // increase views
     await Post.findOneAndUpdate({slug}, { $inc: { views: 1 } },);
     next();


};
export default increaseVisit;