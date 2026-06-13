import Post from '../models/Post.js';

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
  try {
    // Populate the 'user' field to get basic author metadata
    const posts = await Post.find({})
      .populate('user', 'username createdAt bio linkedinUrl twitterUrl githubUrl websiteUrl')
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: posts });
  } catch (error) {
    console.error('getPosts error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve posts.' });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'username createdAt bio linkedinUrl twitterUrl githubUrl websiteUrl');
    if (post) {
      return res.json({ success: true, data: post });
    }
    return res.status(404).json({ success: false, message: 'Post not found' });
  } catch (error) {
    console.error('getPostById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve post.' });
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private (requires authentication)
export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    // req.user is populated by the 'protect' middleware
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const post = new Post({
      title,
      content,
      user: req.user._id, // Assign the authenticated user's ID as the creator
    });

    const createdPost = await post.save();
    return res.status(201).json({ success: true, data: createdPost });
  } catch (error) {
    console.error('createPost error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create post.' });
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (Owner only - authorization handled by middleware)
export const updatePost = async (req, res) => {
  try {
    const { title, content } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Ownership check is handled by `authorizePostOwnership` middleware before this controller
    post.title = title || post.title;
    post.content = content || post.content;

    const updatedPost = await post.save();
    return res.json({ success: true, data: updatedPost });
  } catch (error) {
    console.error('updatePost error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update post.' });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (Owner only - authorization handled by middleware)
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Ownership check is handled by `authorizePostOwnership` middleware before this controller
    await Post.deleteOne({ _id: post._id }); // Use deleteOne with query
    return res.json({ success: true, message: 'Post removed' });
  } catch (error) {
    console.error('deletePost error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete post.' });
  }
};