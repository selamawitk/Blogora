// server/controllers/commentController.js
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId, parentComment: null })
      .populate('user', '_id username')
      .sort({ createdAt: 1 });

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate('user', '_id username')
          .sort({ createdAt: 1 });
        return { ...comment.toObject(), replies };
      })
    );

    res.json(commentsWithReplies);
  } catch (error) {
    console.error(`Error in getComments controller: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error: Could not retrieve comments.' });
  }
};

export const createComment = async (req, res) => {
  const { postId } = req.params;
  const { content, parentComment } = req.body;

  if (!req.user || !req.user._id) {
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

    if (parentComment) {
      const parentExists = await Comment.findById(parentComment);
      if (!parentExists) {
        return res.status(404).json({ message: 'Parent comment not found.' });
      }
    }

    const comment = new Comment({
      content,
      user: req.user._id,
      post: postId,
      parentComment: parentComment || null,
    });

    const createdComment = await comment.save();
    const populatedComment = await Comment.findById(createdComment._id).populate('user', '_id username');
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

    // Cascade delete: if this is a parent comment, delete replies too
    await Promise.all([
      Comment.deleteMany({ parentComment: comment._id }),
      Comment.deleteOne({ _id: comment._id }),
    ]);
    res.json({ message: 'Comment removed.' });
  } catch (error) {
    console.error(`Error in deleteComment controller: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error: Could not delete comment.' });
  }
};