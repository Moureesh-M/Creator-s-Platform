import Post from '../models/Post.js';
import AppError from '../utils/AppError.js';

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res, next) => {
  try {
    const { title, content, category, status, coverImage } = req.body;

    // Validate required fields
    if (!title || !content) {
      return next(new AppError('Please provide title and content', 400));
    }

    // Create post with authenticated user as author
    const post = await Post.create({
      title,
      content,
      coverImage: coverImage || null,
      category,
      status,
      author: req.user._id // From protect middleware
    });

    // Emit socket event to all connected clients (if io is available)
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('newPost', {
          message: `New post created by ${req.user.name}`,
          post: {
            _id: post._id,
            title: post.title,
            createdBy: req.user.name
          }
        });
      }
    } catch (emitErr) {
      console.error('Emit newPost error:', emitErr);
    }

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });

  } catch (error) {
    console.error('Create post error:', error);
    next(error);
  }
};

// @desc    Get posts with pagination
// @route   GET /api/posts?page=1&limit=10
// @access  Private
export const getPosts = async (req, res, next) => {
  try {
    // Get page and limit from query params (with defaults)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Calculate skip value
    const skip = (page - 1) * limit;

    // Get posts for logged-in user only
    const posts = await Post.find({ author: req.user._id })
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email'); // Include author info

    // Get total count for pagination
    const total = await Post.countDocuments({ author: req.user._id });

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get posts error:', error);
    next(error);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Private
export const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email');

    if (!post) {
      return next(new AppError('Post not found', 404));
    }

    // Check if user is the author
    if (post.author._id.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to access this post', 403));
    }

    res.status(200).json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('Get post error:', error);
    next(error);
  }
};

export const getPostById = getPost;

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return next(new AppError('Post not found', 404));
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to update this post', 403));
    }

    // Update post fields
    const { title, content, category, status } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (status) post.status = status;

    post = await post.save();

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });

  } catch (error) {
    console.error('Update post error:', error);
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(new AppError('Post not found', 404));
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to delete this post', 403));
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    next(error);
  }
};
