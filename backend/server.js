const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const promptsRoutes = require('./routes/prompts');
const aiBlogRoutes = require('./routes/ai-blog');
const emailService = require('./utils/emailService');
const openaiService = require('./utils/openaiService');

const app = express();
const PORT = 3033;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize services
async function initializeServices() {
  console.log('🚀 Starting service initialization...');
  
  try {
    // Initialize email service
    await emailService.initialize();
  } catch (error) {
    console.error('❌ Email service initialization failed:', error.message);
  }
  
  try {
    // Initialize OpenAI service
    await openaiService.initialize();
  } catch (error) {
    console.error('❌ OpenAI service initialization failed:', error.message);
  }
  
  // Check overall status
  const emailStatus = emailService.isInitialized();
  const openaiStatus = openaiService.isInitialized();
  
  console.log('\n📊 Service Status:');
  console.log(`📧 Email Service: ${emailStatus ? '✅ Available' : '❌ Not Available'}`);
  console.log(`🤖 OpenAI Service: ${openaiStatus ? '✅ Available' : '❌ Not Available'}`);
  
  if (!emailStatus && !openaiStatus) {
    console.log('\n⚠️  Both services are unavailable. The platform will work with limited functionality.');
    console.log('📧 Email verification will be disabled.');
    console.log('🤖 AI blog generation will be disabled.');
  } else if (!emailStatus) {
    console.log('\n⚠️  Email service is unavailable. Email verification will be disabled.');
  } else if (!openaiStatus) {
    console.log('\n⚠️  OpenAI service is unavailable. AI blog generation will be disabled.');
  } else {
    console.log('\n✅ All services initialized successfully!');
  }
  
  console.log('\n🎯 Platform is ready to use!');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/prompts', promptsRoutes);
app.use('/api/ai-blog', aiBlogRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      email: emailService.isInitialized(),
      openai: openaiService.isInitialized()
    },
    message: 'Blog Platform API is running'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Blog Platform API is running!',
    version: '1.0.0',
    services: {
      email: emailService.isInitialized(),
      openai: openaiService.isInitialized()
    },
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
      prompts: '/api/prompts',
      aiBlog: '/api/ai-blog',
      health: '/api/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Blog Platform API: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log('');
  
  await initializeServices();
}); 