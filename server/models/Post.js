import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    user: { // Add this field to link the post to its creator
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // This references your User model
      required: true,
    },
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);

export default Post;