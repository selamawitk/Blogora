import Like from '../models/Like.js';
import Post from '../models/Post.js';

export const getLikes = async (req, res) => {
  try {
    const { postId } = req.params;
    const likes = await Like.find({ post: postId });
    const count = likes.length;
    const userId = req.user ? req.user._id.toString() : null;
    const userLiked = userId
      ? likes.some((like) => like.user.toString() === userId)
      : false;
    res.json({ count, userLiked });
  } catch (error) {
    console.error('getLikes error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve likes.' });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Not authorized.' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const existing = await Like.findOne({ user: req.user._id, post: postId });

    if (existing) {
      await Like.deleteOne({ _id: existing._id });
      const count = await Like.countDocuments({ post: postId });
      return res.json({ liked: false, count });
    }

    const like = new Like({ user: req.user._id, post: postId });
    await like.save();
    const count = await Like.countDocuments({ post: postId });
    res.status(201).json({ liked: true, count });
  } catch (error) {
    console.error('toggleLike error:', error.message);
    res.status(500).json({ message: 'Failed to toggle like.' });
  }
};
