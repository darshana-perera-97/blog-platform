const express = require('express');
const { readJsonFile, writeJsonFile, generateId } = require('../utils/fileUtils');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all prompts (only user's own prompts for authenticated users, none for unauthenticated)
router.get('/', async (req, res) => {
  try {
    const prompts = await readJsonFile('prompts.json');
    
    // If user is authenticated, show only their own prompts
    // If not authenticated, show no prompts
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const jwt = require('jsonwebtoken');
      const { JWT_SECRET } = require('../middleware/auth');
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userPrompts = prompts.filter(prompt => prompt.authorId === decoded.id);
        res.json(userPrompts);
      } catch (error) {
        // Invalid token, show no prompts
        res.json([]);
      }
    } else {
      // No token, show no prompts
      res.json([]);
    }
  } catch (error) {
    console.error('Get prompts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's own prompts only (protected route)
router.get('/my-prompts', authenticateToken, async (req, res) => {
  try {
    const prompts = await readJsonFile('prompts.json');
    
    // Get only the user's own prompts
    const userPrompts = prompts.filter(prompt => prompt.authorId === req.user.id);
    
    res.json(userPrompts);
  } catch (error) {
    console.error('Get user prompts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single prompt
router.get('/:id', async (req, res) => {
  try {
    const prompts = await readJsonFile('prompts.json');
    const prompt = prompts.find(p => p.id === parseInt(req.params.id));
    
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }
    
    // Check if user can access this prompt
    if (!prompt.isPublic) {
      if (!req.headers.authorization) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const token = req.headers.authorization.split(' ')[1];
      const jwt = require('jsonwebtoken');
      const { JWT_SECRET } = require('../middleware/auth');
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (prompt.authorId !== decoded.id) {
          return res.status(403).json({ message: 'Access denied' });
        }
      } catch (error) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    res.json(prompt);
  } catch (error) {
    console.error('Get prompt error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new prompt (protected route)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content, category, isPublic } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const prompts = await readJsonFile('prompts.json');
    const users = await readJsonFile('users.json');
    
    const user = users.find(u => u.id === req.user.id);
    
    const newPrompt = {
      id: generateId(prompts),
      title,
      content,
      category: category || 'General',
      authorId: req.user.id,
      authorName: user.username,
      isPublic: false, // All prompts are private by default
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    prompts.push(newPrompt);
    await writeJsonFile('prompts.json', prompts);

    res.status(201).json(newPrompt);
  } catch (error) {
    console.error('Create prompt error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update prompt (protected route - only author can update)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, content, category, isPublic } = req.body;
    const promptId = parseInt(req.params.id);

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const prompts = await readJsonFile('prompts.json');
    const promptIndex = prompts.findIndex(p => p.id === promptId);

    if (promptIndex === -1) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    const prompt = prompts[promptIndex];

    // Check if user is the author
    if (prompt.authorId !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own prompts' });
    }

    // Update prompt
    prompts[promptIndex] = {
      ...prompt,
      title,
      content,
      category: category || prompt.category,
      isPublic: false, // All prompts remain private
      updatedAt: new Date().toISOString()
    };

    await writeJsonFile('prompts.json', prompts);
    res.json(prompts[promptIndex]);
  } catch (error) {
    console.error('Update prompt error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete prompt (protected route - only author can delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const promptId = parseInt(req.params.id);
    const prompts = await readJsonFile('prompts.json');
    const promptIndex = prompts.findIndex(p => p.id === promptId);

    if (promptIndex === -1) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    const prompt = prompts[promptIndex];

    // Check if user is the author
    if (prompt.authorId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own prompts' });
    }

    // Remove prompt
    prompts.splice(promptIndex, 1);
    await writeJsonFile('prompts.json', prompts);

    res.json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    console.error('Delete prompt error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 