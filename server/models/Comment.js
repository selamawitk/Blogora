import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    content: { // Changed from 'text' for consistency and clarity
      type: String,
      required: true,
    },
    user: { // Changed from 'author' to link to User model
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;