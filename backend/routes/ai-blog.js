const express = require('express');
const { readJsonFile, writeJsonFile, generateId } = require('../utils/fileUtils');
const { authenticateToken } = require('../middleware/auth');
const openaiService = require('../utils/openaiService');

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

      posts.push(newPost);
      await writeJsonFile('posts.json', posts);

      return res.json({
        message: 'Blog post generated and saved successfully',
        post: newPost,
        generated: true
      });
    }

    // Return generated content without saving
    res.json({
      message: 'Blog post generated successfully',
      generatedBlog: {
        title: generatedBlog.title,
        content: generatedBlog.content,
        metaDescription: generatedBlog.metaDescription
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

module.exports = router; 