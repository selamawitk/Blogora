import Post from '../models/Post.js';
import asyncHandler from 'express-async-handler'; // Assuming you use this for error handling, if not, you can remove it.

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = asyncHandler(async (req, res) => {
  // Populate the 'user' field to get the username of the creator
  const posts = await Post.find({})
    .populate('user', 'username') // Only fetch the 'username' field from the User model
    .sort({ createdAt: -1 });
  res.json(posts);
});

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = asyncHandler(async (req, res) => {
  // Populate the 'user' field to get the username of the creator
  const post = await Post.findById(req.params.id).populate('user', 'username');

  if (post) {
    res.json(post);
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
});

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private (requires authentication)
export const createPost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  // req.user is populated by the 'protect' middleware
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('Not authorized, user not found');
  }

  if (!title || !content) {
    res.status(400);
    throw new Error('Title and content are required');
  }

  const post = new Post({
    title,
    content,
    user: req.user._id, // Assign the authenticated user's ID as the creator
  });

  const createdPost = await post.save();
  res.status(201).json(createdPost);
});

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (Owner only - authorization handled by middleware)
export const updatePost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  const post = await Post.findById(req.params.id);

  if (post) {
    // Ownership check is handled by `authorizePostOwnership` middleware before this controller
    post.title = title || post.title;
    post.content = content || post.content;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
});

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (Owner only - authorization handled by middleware)
export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post) {
    // Ownership check is handled by `authorizePostOwnership` middleware before this controller
    await Post.deleteOne({ _id: post._id }); // Use deleteOne with query
    res.json({ message: 'Post removed' });
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
});