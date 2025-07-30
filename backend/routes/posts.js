const express = require('express');
const { readJsonFile, writeJsonFile, generateId } = require('../utils/fileUtils');
const { authenticateToken } = require('../middleware/auth');
const { getPostImageUrl } = require('../utils/imageUtils');
const imageStorage = require('../utils/imageStorage');

const router = express.Router();

// Get all posts (user's own posts when authenticated, public posts when not)
router.get('/', async (req, res) => {
  try {
    const posts = await readJsonFile('posts.json');
    
    // If user is authenticated, show only their own posts
    // If not authenticated, show only public posts
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const jwt = require('jsonwebtoken');
      const { JWT_SECRET } = require('../middleware/auth');
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userPosts = posts.filter(post => post.authorId === decoded.id);
        // Add image URLs to posts
        const postsWithImages = userPosts.map(post => ({
          ...post,
          imageUrl: getPostImageUrl(post)
        }));
        res.json(postsWithImages);
      } catch (error) {
        // Invalid token, show only public posts
        const publicPosts = posts.filter(post => post.isPublic);
        // Add image URLs to posts
        const postsWithImages = publicPosts.map(post => ({
          ...post,
          imageUrl: getPostImageUrl(post)
        }));
        res.json(postsWithImages);
      }
    } else {
      // No token, show only public posts
      const publicPosts = posts.filter(post => post.isPublic);
      // Add image URLs to posts
      const postsWithImages = publicPosts.map(post => ({
        ...post,
        imageUrl: getPostImageUrl(post)
      }));
      res.json(postsWithImages);
    }
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single post (only if user owns it or it's public)
router.get('/:id', async (req, res) => {
  try {
    const posts = await readJsonFile('posts.json');
    const post = posts.find(p => p.id === parseInt(req.params.id));
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user can access this post
    if (!post.isPublic) {
      if (!req.headers.authorization) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const token = req.headers.authorization.split(' ')[1];
      const jwt = require('jsonwebtoken');
      const { JWT_SECRET } = require('../middleware/auth');
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (post.authorId !== decoded.id) {
          return res.status(403).json({ message: 'Access denied' });
        }
      } catch (error) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    // Add image URL to the post
    const postWithImage = {
      ...post,
      imageUrl: getPostImageUrl(post)
    };
    
    res.json(postWithImage);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new post (protected route - defaults to private)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content, metaDescription, imageUrl, isPublic = false } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const posts = await readJsonFile('posts.json');
    const users = await readJsonFile('users.json');
    
    const user = users.find(u => u.id === req.user.id);
    
    const newPost = {
      id: generateId(posts),
      title,
      content,
      metaDescription: metaDescription || '',
      imageUrl: imageUrl || null,
      authorId: req.user.id,
      authorName: user.username,
      isPublic: false, // Always default to private for security
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save the post first to get the ID
    posts.push(newPost);
    await writeJsonFile('posts.json', posts);

    // If there's a DALL-E image URL, download and save it locally
    if (imageUrl && imageUrl.startsWith('http')) {
      try {
        console.log('💾 Downloading DALL-E image for new post...');
        const localImagePath = await imageStorage.saveGeneratedImage(
          imageUrl, 
          newPost.id, 
          newPost.title
        );
        
        // Update the post with the local image path
        newPost.imageUrl = localImagePath;
        
        // Update the post in the file
        const updatedPosts = await readJsonFile('posts.json');
        const postIndex = updatedPosts.findIndex(p => p.id === newPost.id);
        if (postIndex !== -1) {
          updatedPosts[postIndex] = newPost;
          await writeJsonFile('posts.json', updatedPosts);
        }
        
        console.log('✅ DALL-E image saved locally:', localImagePath);
      } catch (imageError) {
        console.warn('⚠️ Failed to save DALL-E image locally:', imageError.message);
        // Continue without image
      }
    }

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Publish/Unpublish post (protected route - only author can publish)
router.patch('/:id/publish', authenticateToken, async (req, res) => {
  try {
    const { isPublic } = req.body;
    const postId = parseInt(req.params.id);

    if (typeof isPublic !== 'boolean') {
      return res.status(400).json({ message: 'isPublic must be a boolean value' });
    }

    const posts = await readJsonFile('posts.json');
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = posts[postIndex];

    // Check if user is the author
    if (post.authorId !== req.user.id) {
      return res.status(403).json({ message: 'You can only publish your own posts' });
    }

    // Update post publication status
    posts[postIndex] = {
      ...post,
      isPublic: isPublic,
      updatedAt: new Date().toISOString()
    };

    await writeJsonFile('posts.json', posts);
    
    const action = isPublic ? 'published' : 'unpublished';
    res.json({ 
      ...posts[postIndex], 
      message: `Post ${action} successfully` 
    });
  } catch (error) {
    console.error('Publish post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update post (protected route - only author can update)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, content, metaDescription, imageUrl } = req.body; // Remove isPublic from update
    const postId = parseInt(req.params.id);

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const posts = await readJsonFile('posts.json');
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = posts[postIndex];

    // Check if user is the author
    if (post.authorId !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }

    // Update post (keep existing isPublic status)
    posts[postIndex] = {
      ...post,
      title,
      content,
      metaDescription: metaDescription !== undefined ? metaDescription : post.metaDescription,
      imageUrl: imageUrl !== undefined ? imageUrl : post.imageUrl,
      updatedAt: new Date().toISOString()
    };

    await writeJsonFile('posts.json', posts);
    res.json(posts[postIndex]);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete post (protected route - only author can delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const posts = await readJsonFile('posts.json');
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = posts[postIndex];

    // Check if user is the author
    if (post.authorId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    // Delete associated image if it exists
    if (post.imageUrl) {
      await imageStorage.deleteImage(post.imageUrl);
    }

    // Remove post
    posts.splice(postIndex, 1);
    await writeJsonFile('posts.json', posts);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 