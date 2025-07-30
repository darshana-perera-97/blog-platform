const express = require('express');
const { readJsonFile, writeJsonFile, generateId } = require('../utils/fileUtils');
const { authenticateToken } = require('../middleware/auth');
const openaiService = require('../utils/openaiService');
const imageStorage = require('../utils/imageStorage');
const usageTracker = require('../utils/usageTracker');

const router = express.Router();

// Generate blog post using AI and master prompt
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { promptId, topic, style = 'informative', autoSave = false } = req.body;

    if (!promptId || !topic) {
      return res.status(400).json({ 
        message: 'Prompt ID and topic are required' 
      });
    }

    // Check if OpenAI is available
    if (!openaiService.isInitialized()) {
      return res.status(503).json({ 
        message: 'AI blog generation is not available. Please configure OpenAI API key.' 
      });
    }

    // Get the master prompt
    const prompts = await readJsonFile('prompts.json');
    const masterPrompt = prompts.find(p => p.id === parseInt(promptId));

    if (!masterPrompt) {
      return res.status(404).json({ 
        message: 'Master prompt not found' 
      });
    }

    // Check if user owns the prompt
    if (masterPrompt.authorId !== req.user.id) {
      return res.status(403).json({ 
        message: 'You can only use your own master prompts for AI blog generation' 
      });
    }

    // Check daily blog generation limit
    const canGenerate = await usageTracker.canGenerateBlog(req.user.id);
    if (!canGenerate) {
      const remaining = await usageTracker.getRemainingBlogs(req.user.id);
      return res.status(429).json({ 
        message: `Daily blog generation limit reached. You can generate ${remaining} more blogs today.`,
        limitReached: true,
        remaining: remaining
      });
    }

    // Generate blog post using AI
    const generatedBlog = await openaiService.generateBlogPost(
      masterPrompt.content,
      topic,
      style
    );

    // If autoSave is enabled, save the generated post
    if (autoSave) {
      const posts = await readJsonFile('posts.json');
      const users = await readJsonFile('users.json');
      const user = users.find(u => u.id === req.user.id);

      const newPost = {
        id: generateId(posts),
        title: generatedBlog.title,
        content: generatedBlog.content,
        metaDescription: generatedBlog.metaDescription,
        imageUrl: null, // Will be set after image download
        authorId: req.user.id,
        authorName: user.username,
        isPublic: false, // Default to private for AI-generated posts
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        generatedFrom: {
          promptId: promptId,
          promptTitle: masterPrompt.title,
          topic: topic,
          style: style
        }
      };

      // Save the post first to get the ID
      posts.push(newPost);
      await writeJsonFile('posts.json', posts);

      // Download and save the generated image locally
      if (generatedBlog.imageUrl) {
        try {
          console.log('💾 Downloading and saving generated image...');
          const localImagePath = await imageStorage.saveGeneratedImage(
            generatedBlog.imageUrl, 
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
          
          console.log('✅ Image saved locally:', localImagePath);
        } catch (imageError) {
          console.warn('⚠️ Failed to save image locally:', imageError.message);
          // Continue without image
        }
      }

      // Increment usage counter
      await usageTracker.incrementBlogGeneration(req.user.id);
      const usageStats = await usageTracker.getUserUsageStats(req.user.id);

      console.log('💾 Saving AI-generated post with image:', {
        title: newPost.title,
        hasImage: !!newPost.imageUrl,
        imageUrl: newPost.imageUrl
      });

      return res.json({
        message: 'Blog post generated and saved successfully',
        post: newPost,
        generated: true,
        usageStats: usageStats
      });
    }

    // Return generated content without saving
    // Note: For non-auto-save, we return the DALL-E URL directly
    // The image will be downloaded when the user saves the post
    res.json({
      message: 'Blog post generated successfully',
      generatedBlog: {
        title: generatedBlog.title,
        content: generatedBlog.content,
        metaDescription: generatedBlog.metaDescription,
        imageUrl: generatedBlog.imageUrl // This will be the DALL-E URL
      },
      promptUsed: {
        id: masterPrompt.id,
        title: masterPrompt.title,
        content: masterPrompt.content
      },
      generationParams: {
        topic: topic,
        style: style
      },
      generated: false
    });

  } catch (error) {
    console.error('AI blog generation error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to generate blog post' 
    });
  }
});

// Get available master prompts for the user
router.get('/prompts', authenticateToken, async (req, res) => {
  try {
    const prompts = await readJsonFile('prompts.json');
    
    // Get only user's own prompts
    const userPrompts = prompts.filter(prompt => prompt.authorId === req.user.id);

    res.json(userPrompts);
  } catch (error) {
    console.error('Get prompts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get AI service status
router.get('/status', async (req, res) => {
  try {
    const status = {
      available: openaiService.isInitialized(),
      model: openaiService.getConfig()?.openai?.model || 'Not configured',
      maxTokens: openaiService.getConfig()?.openai?.maxTokens || 500
    };

    res.json(status);
  } catch (error) {
    console.error('Get AI status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user usage statistics
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const usageStats = await usageTracker.getUserUsageStats(req.user.id);
    res.json(usageStats);
  } catch (error) {
    console.error('Get usage stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 