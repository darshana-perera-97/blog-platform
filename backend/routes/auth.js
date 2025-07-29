const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readJsonFile, writeJsonFile, generateId } = require('../utils/fileUtils');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');
const emailService = require('../utils/emailService');
const { generateVerificationToken, createVerificationToken, verifyToken, cleanupExpiredTokens } = require('../utils/verificationUtils');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    const users = await readJsonFile('users.json');
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === email || user.username === username);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: generateId(users),
      username,
      email,
      password: hashedPassword,
      emailVerified: false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeJsonFile('users.json', users);

    // Generate verification token
    const verificationToken = await createVerificationToken(newUser.id, email);

    // Try to send verification email
    let emailSent = false;
    let emailError = null;
    
    if (emailService.isInitialized()) {
      try {
        emailSent = await emailService.sendVerificationEmail(email, verificationToken, username);
        if (!emailSent) {
          emailError = 'Failed to send verification email';
        }
      } catch (emailErr) {
        emailError = emailErr.message;
      }
    } else {
      emailError = 'Email service not available';
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        emailVerified: newUser.emailVerified
      },
      emailSent,
      emailError,
      note: emailSent ? 
        'Please check your email to verify your account' : 
        'Account created but verification email could not be sent. Please contact support.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Email/Username and password are required' });
    }

    const users = await readJsonFile('users.json');
    
    // Try to find user by email or username
    const user = users.find(u => u.email === emailOrUsername || u.username === emailOrUsername);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email/username or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email/username or password' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(401).json({ 
        message: 'Please verify your email before logging in',
        emailNotVerified: true,
        email: user.email
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const users = await readJsonFile('users.json');
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const verificationTokens = await readJsonFile('verification-tokens.json');
    const tokenData = verificationTokens.find(t => t.token === token);

    if (!tokenData) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Check if token is expired
    if (new Date() > new Date(tokenData.expiresAt)) {
      return res.status(400).json({ message: 'Verification token has expired' });
    }

    // Update user email verification status
    const users = await readJsonFile('users.json');
    const userIndex = users.findIndex(u => u.id === tokenData.userId);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    users[userIndex].emailVerified = true;
    await writeJsonFile('users.json', users);

    // Remove used token
    const updatedTokens = verificationTokens.filter(t => t.token !== token);
    await writeJsonFile('verification-tokens.json', updatedTokens);

    // Try to send welcome email
    let welcomeEmailSent = false;
    if (emailService.isInitialized()) {
      try {
        welcomeEmailSent = await emailService.sendWelcomeEmail(users[userIndex].email, users[userIndex].username);
      } catch (emailErr) {
        console.error('Failed to send welcome email:', emailErr.message);
      }
    }

    res.json({
      message: 'Email verified successfully',
      user: {
        id: users[userIndex].id,
        username: users[userIndex].username,
        email: users[userIndex].email,
        emailVerified: true
      },
      welcomeEmailSent
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const users = await readJsonFile('users.json');
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = await createVerificationToken(user.id, email);

    // Try to send verification email
    let emailSent = false;
    let emailError = null;
    
    if (emailService.isInitialized()) {
      try {
        emailSent = await emailService.sendVerificationEmail(email, verificationToken, user.username);
        if (!emailSent) {
          emailError = 'Failed to send verification email';
        }
      } catch (emailErr) {
        emailError = emailErr.message;
      }
    } else {
      emailError = 'Email service not available';
    }

    res.json({
      message: emailSent ? 'Verification email sent successfully' : 'Failed to send verification email',
      emailSent,
      emailError,
      note: emailSent ? 
        'Please check your email to verify your account' : 
        'Verification email could not be sent. Please contact support.'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cleanup expired tokens every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

module.exports = router; 