const OpenAI = require('openai');
const { readConfigFile } = require('./fileUtils');

class OpenAIService {
  constructor() {
    this.openai = null;
    this.config = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      console.log('🤖 Initializing OpenAI service...');
      
      // Try to read the config file
      try {
        this.config = await readConfigFile('openai-config.json');
        console.log('OpenAI Config loaded successfully');
      } catch (configError) {
        console.error('Failed to load OpenAI config:', configError.message);
        console.log('🤖 AI blog generation will be disabled. Please configure OpenAI API key.');
        this.initialized = false;
        return;
      }
      
      // Validate config structure
      if (!this.config || !this.config.openai || !this.config.openai.apiKey || !this.config.openai.model) {
        console.error('Invalid OpenAI configuration structure - missing required fields');
        console.log('🤖 AI blog generation will be disabled. Please configure OpenAI API key.');
        this.initialized = false;
        return;
      }
      
      // Check if API key is placeholder
      if (this.config.openai.apiKey === 'your-openai-api-key-here') {
        console.log('⚠️  OpenAI API key not configured. Blog generation will be disabled.');
        this.initialized = false;
        return;
      }
      
      console.log('OpenAI Config loaded:', {
        model: this.config.openai.model,
        maxTokens: this.config.openai.maxTokens,
        temperature: this.config.openai.temperature
      });
      
      this.openai = new OpenAI({
        apiKey: this.config.openai.apiKey
      });

      // Test the connection with a simple request
      console.log('🔍 Testing OpenAI connection...');
      const testResponse = await this.openai.chat.completions.create({
        model: this.config.openai.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      });

      this.initialized = true;
      console.log('✅ OpenAI service initialized successfully');
    } catch (error) {
      console.error('❌ OpenAI service initialization failed:', error.message);
      
      if (error.code === 'invalid_api_key') {
        console.log('\n🔧 API Key Error - Please check:');
        console.log('1. API key is correct and starts with "sk-"');
        console.log('2. API key has sufficient credits');
        console.log('3. API key is not expired');
      } else if (error.code === 'rate_limit_exceeded') {
        console.log('\n🔧 Rate Limit Error - Please check:');
        console.log('1. API usage limits in OpenAI dashboard');
        console.log('2. Account billing status');
      } else if (error.code === 'insufficient_quota') {
        console.log('\n🔧 Quota Error - Please check:');
        console.log('1. Account has sufficient credits');
        console.log('2. Billing is set up correctly');
      }
      
      console.log('🤖 AI blog generation will be disabled. Please configure OpenAI API key.');
      this.initialized = false;
    }
  }

  async generateBlogPost(masterPrompt, topic, style = 'informative') {
    if (!this.initialized || !this.openai) {
      throw new Error('OpenAI service not initialized or API key not configured');
    }

    try {
      const prompt = this.buildBlogPrompt(masterPrompt, topic, style);
      
      const response = await this.openai.chat.completions.create({
        model: this.config.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional blog writer. Generate high-quality, engaging blog posts with proper structure and SEO optimization.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.openai.maxTokens,
        temperature: this.config.openai.temperature
      });

      const generatedContent = response.choices[0].message.content;
      return this.parseGeneratedContent(generatedContent);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to generate blog post: ${error.message}`);
    }
  }

  buildBlogPrompt(masterPrompt, topic, style) {
    const contentLength = this.config.blogGeneration.defaultContentLength;
    const titleLength = this.config.blogGeneration.defaultTitleLength;
    const metaLength = this.config.blogGeneration.defaultMetaDescriptionLength;

    return `
Using this master prompt as your guide: "${masterPrompt}"

Create a blog post about: "${topic}"

Style: ${style}

Requirements:
1. Title: Create an engaging, SEO-friendly title (max ${titleLength} characters)
2. Content: Write ${contentLength} words of high-quality, informative content
3. Meta Description: Create an SEO-optimized meta description (max ${metaLength} characters)

Format your response exactly like this:
TITLE: [Your title here]
META: [Your meta description here]
CONTENT: [Your content here]

Make sure the content is well-structured with paragraphs, engaging, and provides value to readers.
`;
  }

  parseGeneratedContent(content) {
    try {
      const lines = content.split('\n');
      let title = '';
      let metaDescription = '';
      let blogContent = '';
      let currentSection = '';

      for (const line of lines) {
        if (line.startsWith('TITLE:')) {
          title = line.replace('TITLE:', '').trim();
        } else if (line.startsWith('META:')) {
          metaDescription = line.replace('META:', '').trim();
        } else if (line.startsWith('CONTENT:')) {
          currentSection = 'content';
        } else if (currentSection === 'content') {
          blogContent += line + '\n';
        }
      }

      return {
        title: title || 'Generated Blog Post',
        metaDescription: metaDescription || '',
        content: blogContent.trim() || 'Content generation failed. Please try again.'
      };
    } catch (error) {
      console.error('Error parsing generated content:', error);
      return {
        title: 'Generated Blog Post',
        metaDescription: 'AI-generated blog post',
        content: content || 'Content generation failed. Please try again.'
      };
    }
  }

  isInitialized() {
    return this.initialized;
  }

  getConfig() {
    return this.config;
  }
}

module.exports = new OpenAIService(); 