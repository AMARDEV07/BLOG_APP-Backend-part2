import ImageKit from "imagekit";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";





// all posts data fetch  infinite scrolling
export const getPosts = async (req, res) => {

  //pagenation logic db send dta when data lode
  const  page=parseInt(req.query.page)||1;
  const limit=parseInt(req.query.limit)||2;


  // creating all query like sarch,featre etc..and req them form qyery to acess them..
  //search feature all query 
  const query={};

  const cat=req.query.cat;
  const author=req.query.author;
  const searchQuery=req.query.search
  const sortQuery=req.query.sort
  const featured=req.query.featured;


  if(cat){
    query.category=cat;
  }
  if(searchQuery){
   query.title={$regex:searchQuery,$options:"i"};
  }
  if(author){
    const user=await User.findOne({username:author}).select('_id')
    if(!user){
      return res.status(404).json("NO Post Found")
    }
     query.user=user._id;

  }

  //sort post according popular tranding ,most popular
   let sortObj={createdAt:-1};

  if(sortQuery){
   switch(sortQuery){
    case "newest":
      sortObj={createdAt:-1}
      break;

      case"oldest":
       sortObj={createdAt:1}
      break;

      case"popular":
       sortObj={visit:-1}
      break;

      case"trending":
       sortObj={visit:-1}
       query.createdAt={
        $gte:new Date(new Date().getTime()-7*24*60*60*1000),
       };
      break;


      default:
        break;
   }
  }
  
//featured post.....
if(featured){
  query.isFeatured=true;

}


  const posts = await Post.find(query)
  //jo obj id ari thi na user fetch krta time isa bs user ayga ..
  .populate("user","username")
  .sort(sortObj)
  .limit(limit)
  .skip((page-1)*limit)

  // get total no of posts 
  const totalPosts=await Post.countDocuments(query);
  const hasMore =page*limit<totalPosts;
  res.status(200).json({posts,hasMore});

};




//single post data get.....
export const getPost = async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug }).populate
  ("user","username img");
  res.status(200).json(post);
};




// creting post in react quill 

export const createPost = async (req, res) => {
  //protected routes like jwt chek krga  user h nahi h
  //user id nahi
  const clerkUserId = req.auth.userId;
  if (!clerkUserId) {
    return res.status(401).json("NOT auth");
  }

  // validation for user user nahi h
  const user = await User.findOne({ clerkUserId });
  if (!user) {
    return res.status(404).json("user not found");
  }





  //creating slug-automatically by changing tittelin samller case
  let slug = req.body.title.replace(/ /g, "-").toLowerCase();
  let existingPost = await Post.findOne({ slug });
  let counter = 2;

  while (existingPost) {
    slug = `${originalSlug}-${counter}`;
    existingPost = await Post.findOne({ slug });
    counter++;
  }
  const newPost = new Post({ user: user._id, slug, ...req.body });
  const post = await newPost.save();
  res.status(200).json(post);
};




//delete post
export const deletePost = async (req, res) => {
  const clerkUserId = req.auth.userId;

  if (!clerkUserId) {
    return res.status(401).json("NOT auth");
  }





  //check usser role base auth cindition 
  //if role ha addmin ka toh find kro id sa or dekete kr do 
  const role=req.auth.sessionClaims?.metadata?.role|| "user"
  if(role==="admin"){
    await Post.findByIdAndDelete(req.params.id);
    return res.status(200).json("post has been deleeted");

  }
  const user = await User.findOne({ clerkUserId });

  const deletedPost = await Post.findByIdAndDelete({
    _id: req.params.id,
    user: user._id,
  });
  if (!deletedPost) {
    return res.status(403).json("you can delete only ur post");
  }
  res.status(200).json("post has been deleeted");
};






//festure post 
export const featurePost = async (req, res) => {
  const clerkUserId = req.auth.userId;
  const postId=req.body.postId;

  if (!clerkUserId) {
    return res.status(401).json("NOT auth");
  }
  const role=req.auth.sessionClaims?.metadata?.role|| "user";

  if(role !=="admin"){
    return res.status(403).json("you can not feature post");

  }
  const post =await Post.findById(postId);
  if(!post){
    return res.status(404).json("post not found!")
  }
  const isFeatured=post.isFeatured;
  const updatedPost=await Post.findByIdAndUpdate
  (postId,
    {
    isFeatured:!isFeatured,
  
  },
    {new:true}
);
 
  res.status(200).json(updatedPost);
};




// ceating function for video uplode  auth function by image kit
export const uploadAuth = async (req, res) => {

  //defining images kit:
  const imagekit = new ImageKit({
    urlEndpoint: process.env.IK_URL_ENDPOINT, 
    publicKey: process.env.IK_PUBLIC_KEY,
    privateKey: process.env.IK_PRIVATE_KEY,
  });

  let result = imagekit.getAuthenticationParameters();
  res.send(result);
};
