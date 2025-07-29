// AI-powered SEO content generation service
import config from '../config';
import aiConfig from '../ai-config';

class SEOAIService {
  constructor() {
    this.apiKey = aiConfig.openai.apiKey;
    this.baseURL = aiConfig.openai.baseURL;
    this.model = aiConfig.openai.model;
    this.maxTokens = aiConfig.openai.maxTokens;
    this.temperature = aiConfig.openai.temperature;
    this.cache = new Map();
    this.retryAttempts = aiConfig.service.retryAttempts;
    this.retryDelay = aiConfig.service.retryDelay;
  }

  // Check if AI service is available
  isAvailable() {
    return !!this.apiKey;
  }

  // Get cached SEO data
  getCachedSEO(key) {
    if (!aiConfig.service.cacheEnabled) return null;
    
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < aiConfig.service.cacheDuration) {
      return cached.data;
    }
    
    this.cache.delete(key);
    return null;
  }

  // Cache SEO data
  setCachedSEO(key, data) {
    if (!aiConfig.service.cacheEnabled) return;
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Cleanup old cache entries
    if (this.cache.size > aiConfig.performance.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  // Generate cache key
  generateCacheKey(type, content, title) {
    const hash = btoa(`${type}-${content.substring(0, 100)}-${title}`).replace(/[^a-zA-Z0-9]/g, '');
    return `${aiConfig.performance.cacheKey}-${hash}`;
  }

  // Generate SEO meta description
  async generateMetaDescription(content, title, maxLength = aiConfig.seo.metaDescription.maxLength) {
    const cacheKey = this.generateCacheKey('metaDescription', content, title);
    const cached = this.getCachedSEO(cacheKey);
    if (cached) return cached;

    if (!this.isAvailable()) {
      const fallback = this.generateFallbackDescription(content, title, maxLength);
      this.setCachedSEO(cacheKey, fallback);
      return fallback;
    }

    try {
      const prompt = `Generate a compelling SEO meta description for a blog post with the following requirements:
- Title: "${title}"
- Content preview: "${content.substring(0, 500)}..."
- Maximum length: ${maxLength} characters
- Include relevant keywords naturally
- Make it engaging and click-worthy
- Focus on the main value proposition
- Use active voice
- Avoid clickbait

Generate only the meta description, no additional text.`;

      const response = await this.callOpenAIWithRetry(prompt);
      this.setCachedSEO(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error generating meta description:', error);
      const fallback = this.generateFallbackDescription(content, title, maxLength);
      this.setCachedSEO(cacheKey, fallback);
      return fallback;
    }
  }

  // Generate SEO keywords
  async generateKeywords(content, title, maxKeywords = aiConfig.seo.keywords.maxCount) {
    const cacheKey = this.generateCacheKey('keywords', content, title);
    const cached = this.getCachedSEO(cacheKey);
    if (cached) return cached;

    if (!this.isAvailable()) {
      const fallback = this.generateFallbackKeywords(content, title, maxKeywords);
      this.setCachedSEO(cacheKey, fallback);
      return fallback;
    }

    try {
      const prompt = `Extract and generate SEO keywords for a blog post with the following requirements:
- Title: "${title}"
- Content preview: "${content.substring(0, 800)}..."
- Maximum keywords: ${maxKeywords}
- Include both primary and secondary keywords
- Focus on relevant, searchable terms
- Consider user search intent
- Include long-tail keywords where appropriate
- Separate keywords with commas

Generate only the keywords, no additional text.`;

      const response = await this.callOpenAIWithRetry(prompt);
      this.setCachedSEO(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error generating keywords:', error);
      const fallback = this.generateFallbackKeywords(content, title, maxKeywords);
      this.setCachedSEO(cacheKey, fallback);
      return fallback;
    }
  }

  // Generate optimized title
  async generateOptimizedTitle(originalTitle, content, maxLength = aiConfig.seo.title.maxLength) {
    const cacheKey = this.generateCacheKey('optimizedTitle', content, originalTitle);
    const cached = this.getCachedSEO(cacheKey);
    if (cached) return cached;

    if (!this.isAvailable()) {
      const fallback = this.generateFallbackTitle(originalTitle, maxLength);
      this.setCachedSEO(cacheKey, fallback);
      return fallback;
    }

    try {
      const prompt = `Optimize this blog post title for SEO with the following requirements:
- Original title: "${originalTitle}"
- Content preview: "${content.substring(0, 500)}..."
- Maximum length: ${maxLength} characters
- Include primary keyword naturally
- Make it compelling and click-worthy
- Maintain the original meaning
- Use power words where appropriate
- Avoid clickbait
- Consider search intent

Generate only the optimized title, no additional text.`;

      const response = await this.callOpenAIWithRetry(prompt);
      this.setCachedSEO(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error generating optimized title:', error);
      const fallback = this.generateFallbackTitle(originalTitle, maxLength);
      this.setCachedSEO(cacheKey, fallback);
      return fallback;
    }
  }

  // Generate social media description
  async generateSocialDescription(content, title, platform = 'general', maxLength = aiConfig.seo.socialDescription.maxLength) {
    const cacheKey = this.generateCacheKey(`social-${platform}`, content, title);
    const cached = this.getCachedSEO(cacheKey);
    if (cached) return cached;

    if (!this.isAvailable()) {
      const fallback = this.generateFallbackDescription(content, title, maxLength);
      this.setCachedSEO(cacheKey, fallback);
      return fallback;
    }

    try {
      const platformConfig = aiConfig.platforms[platform] || aiConfig.platforms.general;
      const prompt = `Generate a social media description for a blog post with the following requirements:
- Title: "${title}"
- Content preview: "${content.substring(0, 500)}..."
- Platform: ${platform} (${platformConfig.tone} tone, focus on ${platformConfig.focus})
- Maximum length: ${maxLength} characters
- Make it shareable and engaging
- ${platformConfig.hashtags ? 'Include relevant hashtags' : 'No hashtags needed'}
- Encourage engagement
- Highlight the main value proposition

Generate only the description, no additional text.`;

      const response = await this.callOpenAIWithRetry(prompt);
      this.setCachedSEO(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error generating social description:', error);
      const fallback = this.generateFallbackDescription(content, title, maxLength);
      this.setCachedSEO(cacheKey, fallback);
      return fallback;
    }
  }

  // Generate structured data description
  async generateStructuredDescription(content, title, maxLength = 200) {
    const cacheKey = this.generateCacheKey('structuredDescription', content, title);
    const cached = this.getCachedSEO(cacheKey);
    if (cached) return cached;

    if (!this.isAvailable()) {
      const fallback = this.generateFallbackDescription(content, title, maxLength);
      this.setCachedSEO(cacheKey, fallback);
      return fallback;
    }

    try {
      const prompt = `Generate a structured data description for a blog post with the following requirements:
- Title: "${title}"
- Content preview: "${content.substring(0, 500)}..."
- Maximum length: ${maxLength} characters
- Optimize for search engine rich snippets
- Include key information and value proposition
- Use clear, descriptive language
- Focus on what readers will learn or gain
- Include relevant keywords naturally

Generate only the description, no additional text.`;

      const response = await this.callOpenAIWithRetry(prompt);
      this.setCachedSEO(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error generating structured description:', error);
      const fallback = this.generateFallbackDescription(content, title, maxLength);
      this.setCachedSEO(cacheKey, fallback);
      return fallback;
    }
  }

  // Generate comprehensive SEO data
  async generateComprehensiveSEO(post, config) {
    const cacheKey = this.generateCacheKey('comprehensive', post.content, post.title);
    const cached = this.getCachedSEO(cacheKey);
    if (cached) return cached;

    if (!this.isAvailable()) {
      const fallback = this.generateFallbackSEO(post, config);
      this.setCachedSEO(cacheKey, fallback);
      return fallback;
    }

    try {
      const prompt = `Generate comprehensive SEO data for a blog post with the following requirements:

POST INFORMATION:
- Title: "${post.title}"
- Content: "${post.content.substring(0, 1000)}..."
- Author: "${config.user.username}"
- Category/Topic: Extract from content

REQUIREMENTS:
1. Meta Description (max 160 chars): Compelling, click-worthy description
2. Keywords (max 10): Relevant, searchable keywords separated by commas
3. Social Media Title (max 60 chars): Optimized for social sharing
4. Social Media Description (max 200 chars): Engaging for social platforms
5. Structured Data Description (max 200 chars): For rich snippets
6. Primary Keyword: Main focus keyword
7. Secondary Keywords (max 5): Supporting keywords
8. Search Intent: Informational, Navigational, or Transactional
9. Content Type: Article, Guide, Tutorial, Review, etc.

Format the response as JSON with these exact keys:
{
  "metaDescription": "...",
  "keywords": "...",
  "socialTitle": "...",
  "socialDescription": "...",
  "structuredDescription": "...",
  "primaryKeyword": "...",
  "secondaryKeywords": ["...", "..."],
  "searchIntent": "...",
  "contentType": "..."
}`;

      const response = await this.callOpenAIWithRetry(prompt);
      const seoData = JSON.parse(response);
      
      const result = {
        ...seoData,
        generatedByAI: true,
        timestamp: new Date().toISOString()
      };

      this.setCachedSEO(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error generating comprehensive SEO:', error);
      const fallback = this.generateFallbackSEO(post, config);
      this.setCachedSEO(cacheKey, fallback);
      return fallback;
    }
  }

  // Call OpenAI API with retry logic
  async callOpenAIWithRetry(prompt, attempt = 1) {
    try {
      return await this.callOpenAI(prompt);
    } catch (error) {
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        await this.delay(this.retryDelay * attempt);
        return this.callOpenAIWithRetry(prompt, attempt + 1);
      }
      throw error;
    }
  }

  // Determine if error is retryable
  shouldRetry(error) {
    const retryableErrors = [429, 500, 502, 503, 504];
    return retryableErrors.includes(error.status) || error.message.includes('network');
  }

  // Delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Call OpenAI API
  async callOpenAI(prompt) {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO content generator. Generate concise, engaging, and SEO-optimized content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature
      })
    });

    if (!response.ok) {
      const error = new Error(`OpenAI API error: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Fallback methods when AI is not available
  generateFallbackDescription(content, title, maxLength = 160) {
    const description = content.substring(0, maxLength - 3).trim();
    return description.length === maxLength - 3 ? `${description}...` : description;
  }

  generateFallbackKeywords(content, title, maxKeywords = 10) {
    const words = `${title} ${content}`.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other', 'about', 'many', 'then', 'them', 'these', 'some', 'what', 'into', 'more', 'very', 'when', 'just', 'only', 'know', 'take', 'than', 'first', 'been', 'good', 'make', 'over', 'think', 'also', 'after', 'work', 'years', 'through', 'much', 'before', 'must', 'well', 'should', 'because', 'such', 'each', 'those', 'people', 'most', 'come', 'state', 'now', 'never', 'between', 'high', 'really', 'something', 'another', 'often', 'through', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'want', 'way', 'look', 'give', 'most', 'us'].includes(word));
    
    const uniqueWords = [...new Set(words)];
    return uniqueWords.slice(0, maxKeywords).join(', ');
  }

  generateFallbackTitle(originalTitle, maxLength = 60) {
    return originalTitle.length <= maxLength ? originalTitle : originalTitle.substring(0, maxLength - 3) + '...';
  }

  generateFallbackSEO(post, config) {
    return {
      metaDescription: this.generateFallbackDescription(post.content, post.title),
      keywords: this.generateFallbackKeywords(post.content, post.title),
      socialTitle: this.generateFallbackTitle(post.title),
      socialDescription: this.generateFallbackDescription(post.content, post.title, 200),
      structuredDescription: this.generateFallbackDescription(post.content, post.title, 200),
      primaryKeyword: post.title.split(' ').slice(0, 3).join(' '),
      secondaryKeywords: this.generateFallbackKeywords(post.content, post.title, 5).split(', '),
      searchIntent: 'Informational',
      contentType: 'Article',
      generatedByAI: false,
      timestamp: new Date().toISOString()
    };
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: aiConfig.performance.maxCacheSize,
      enabled: aiConfig.service.cacheEnabled
    };
  }
}

export default new SEOAIService(); 