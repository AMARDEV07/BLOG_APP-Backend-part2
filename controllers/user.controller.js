import User from "../models/user.model.js";

// post find krega jo user name save kaliya hai
export const getUserSavedPosts = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;

    if (!clerkUserId) {
      return res.status(401).json({ message: "Not authenticated!" });
    }

    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json(user.savedPosts);
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    res.status(500).json({ message: "Error fetching saved posts", error: error.message });
  }
};

// post saved routes.. 
export const savePost = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const postId = req.body.postId;

    if (!clerkUserId) {
      return res.status(401).json({ message: "Not authenticated!" });
    }

    if (!postId) {
      return res.status(400).json({ message: "Post ID is required!" });
    }

    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const isSaved = user.savedPosts.some((p) => p.toString() === postId);

    if (!isSaved) {
      await User.findByIdAndUpdate(user._id, {
        $push: { savedPosts: postId },
      });
    } else {
      await User.findByIdAndUpdate(user._id, {
        $pull: { savedPosts: postId },
      });
    }

    setTimeout(() => {
      res.status(200).json(isSaved ? "Post unsaved" : "Post saved");
    }, 3000);
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).json({ message: "Error saving post", error: error.message });
  }
};