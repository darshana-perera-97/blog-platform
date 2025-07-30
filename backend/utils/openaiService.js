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
      const parsedContent = this.parseGeneratedContent(generatedContent);
      
      // Generate image for the blog post
      let imageUrl = null;
      try {
        console.log('🖼️ Generating image for blog post:', parsedContent.title);
        console.log('📝 Topic:', topic);
        imageUrl = await this.generateBlogImage(parsedContent.title, topic);
        console.log('✅ Image generated successfully:', imageUrl ? 'Yes' : 'No');
        if (imageUrl) {
          console.log('🔗 Image URL:', imageUrl);
        }
      } catch (imageError) {
        console.warn('❌ Image generation failed, will use placeholder:', imageError.message);
        console.error('Image generation error details:', imageError);
        imageUrl = null;
      }

      return {
        ...parsedContent,
        imageUrl: imageUrl
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to generate blog post: ${error.message}`);
    }
  }

  async generateBlogImage(title, topic) {
    if (!this.initialized || !this.openai) {
      throw new Error('OpenAI service not initialized or API key not configured');
    }

    try {
      // Use ChatGPT to create a better image prompt
      console.log('🤖 Using ChatGPT to generate image prompt...');
      const imagePrompt = await this.buildImagePromptWithChatGPT(title, topic);
      console.log('🖼️ ChatGPT-generated image prompt:', imagePrompt);
      
      // Use DALL-E 3 to generate the actual image
      console.log('🎨 Using DALL-E 3 to generate image...');
      console.log('📝 DALL-E prompt:', imagePrompt);
      
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        size: "1024x1024",
        quality: "standard",
        n: 1,
      });

      if (!response.data || !response.data[0] || !response.data[0].url) {
        throw new Error('No image URL received from DALL-E API');
      }

      const imageUrl = response.data[0].url;
      console.log('🖼️ Generated image URL:', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('❌ OpenAI Image API error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        response: error.response?.data
      });
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  }

  async buildImagePromptWithChatGPT(title, topic) {
    try {
      const prompt = `Create a detailed, professional image prompt for a blog header image.

Blog Title: "${title}"
Topic: "${topic}"

Requirements:
- Professional, modern design
- Suitable for blog headers
- Relevant to the topic
- No text overlay
- High contrast and good composition
- Clean, minimalistic style
- Suitable for both light and dark themes

Generate a detailed, creative prompt that will produce an excellent image. Focus on visual elements, colors, and composition.`;

      const response = await this.openai.chat.completions.create({
        model: this.config.openai.model, // Use configured model instead of hardcoded gpt-4
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.7
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.warn('ChatGPT prompt generation failed, using fallback:', error.message);
      return this.buildFallbackImagePrompt(title, topic);
    }
  }

  buildFallbackImagePrompt(title, topic) {
    return `Create a professional, high-quality blog header image for a blog post titled "${title}" about "${topic}". 
    
    Requirements:
    - Modern, clean design
    - Professional appearance
    - Relevant to the topic
    - Suitable for blog headers
    - No text overlay (we'll add text separately)
    - High contrast and good composition
    - Suitable for both light and dark themes
    
    Style: Professional, modern, clean, minimalistic`;
  }

  buildImagePrompt(title, topic) {
    // This method is kept for backward compatibility
    return this.buildFallbackImagePrompt(title, topic);
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