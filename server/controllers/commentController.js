// server/controllers/commentController.js
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('user', 'username')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    console.error(`Error in getComments controller: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error: Could not retrieve comments.' });
  }
};

export const createComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  // The 'protect' middleware ensures req.user is set
  if (!req.user || !req.user._id) {
    // This should ideally be caught by 'protect' middleware before this point
    return res.status(401).json({ message: 'Not authorized, user not found.' });
  }

  if (!content) {
    return res.status(400).json({ message: 'Comment content is required.' });
  }

  try {
    const postExists = await Post.findById(postId);
    if (!postExists) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const comment = new Comment({
      content,
      user: req.user._id, // Assign the authenticated user's ID
      post: postId,
    });

    const createdComment = await comment.save();
    // Populate the user on the created comment before sending it back
    const populatedComment = await Comment.findById(createdComment._id).populate('user', 'username');
    res.status(201).json(populatedComment);
  } catch (error) {
    console.error(`Error in createComment controller: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error: Could not create comment.' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    // IMPORTANT: Ownership check for comment deletion
    // The 'protect' middleware ensures req.user is available here
    if (!req.user || comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment.' });
    }

    await Comment.deleteOne({ _id: req.params.id });
    res.json({ message: 'Comment removed.' });
  } catch (error) {
    console.error(`Error in deleteComment controller: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error: Could not delete comment.' });
  }
};