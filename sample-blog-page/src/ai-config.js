// AI Configuration for SEO Service
const aiConfig = {
  // OpenAI API Configuration
  openai: {
    apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
    model: process.env.REACT_APP_AI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.REACT_APP_AI_MAX_TOKENS) || 300,
    temperature: parseFloat(process.env.REACT_APP_AI_TEMPERATURE) || 0.7,
    baseURL: 'https://api.openai.com/v1/chat/completions'
  },

  // AI Service Settings
  service: {
    enabled: true,
    fallbackEnabled: true,
    cacheEnabled: true,
    cacheDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    retryAttempts: 3,
    retryDelay: 1000 // 1 second
  },

  // SEO Generation Settings
  seo: {
    metaDescription: {
      maxLength: 160,
      includeKeywords: true,
      clickWorthy: true
    },
    keywords: {
      maxCount: 10,
      includeLongTail: true,
      considerSearchIntent: true
    },
    title: {
      maxLength: 60,
      includePrimaryKeyword: true,
      compelling: true
    },
    socialDescription: {
      maxLength: 200,
      platformSpecific: true,
      includeHashtags: true
    }
  },

  // Platform-specific prompts
  platforms: {
    facebook: {
      tone: 'emotional',
      focus: 'engagement',
      hashtags: false
    },
    twitter: {
      tone: 'concise',
      focus: 'shareability',
      hashtags: true
    },
    linkedin: {
      tone: 'professional',
      focus: 'business value',
      hashtags: false
    },
    general: {
      tone: 'balanced',
      focus: 'engagement',
      hashtags: false
    }
  },

  // Content type detection
  contentTypes: {
    article: {
      keywords: ['article', 'post', 'blog', 'content'],
      intent: 'informational'
    },
    guide: {
      keywords: ['guide', 'tutorial', 'how-to', 'step-by-step'],
      intent: 'informational'
    },
    review: {
      keywords: ['review', 'analysis', 'evaluation', 'assessment'],
      intent: 'informational'
    },
    news: {
      keywords: ['news', 'update', 'announcement', 'latest'],
      intent: 'informational'
    },
    opinion: {
      keywords: ['opinion', 'viewpoint', 'perspective', 'thoughts'],
      intent: 'informational'
    }
  },

  // Search intent classification
  searchIntents: {
    informational: {
      keywords: ['what', 'how', 'why', 'when', 'where', 'guide', 'tutorial', 'learn'],
      description: 'User wants to learn or understand something'
    },
    navigational: {
      keywords: ['find', 'locate', 'website', 'page', 'site'],
      description: 'User wants to find a specific website or page'
    },
    transactional: {
      keywords: ['buy', 'purchase', 'download', 'sign up', 'register'],
      description: 'User wants to complete a transaction or action'
    }
  },

  // Error handling
  errors: {
    apiKeyMissing: 'OpenAI API key is not configured. AI SEO generation will be disabled.',
    apiError: 'OpenAI API error occurred. Falling back to basic SEO generation.',
    rateLimit: 'OpenAI API rate limit exceeded. Please try again later.',
    invalidResponse: 'Invalid response from OpenAI API. Using fallback generation.',
    networkError: 'Network error occurred. Check your internet connection.'
  },

  // Validation rules
  validation: {
    title: {
      minLength: 10,
      maxLength: 60,
      required: true
    },
    description: {
      minLength: 50,
      maxLength: 160,
      required: true
    },
    keywords: {
      minCount: 3,
      maxCount: 15,
      required: true
    }
  },

  // Performance optimization
  performance: {
    debounceDelay: 500, // milliseconds
    cacheKey: 'ai-seo-cache',
    maxCacheSize: 100, // number of cached items
    cleanupInterval: 60 * 60 * 1000 // 1 hour
  }
};

export default aiConfig; 