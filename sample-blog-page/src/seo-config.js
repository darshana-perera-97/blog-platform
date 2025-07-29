// SEO Configuration for Sample Blog Page with AI Integration
import seoAIService from './services/seoAI';

const seoConfig = {
  // Default SEO settings
  default: {
    title: 'Sample Blog Page',
    description: 'A showcase of blog posts and articles',
    keywords: 'blog, articles, posts, insights, content',
    author: 'Blog Author',
    siteName: 'Sample Blog Page',
    siteUrl: 'http://localhost:3000',
    image: '/logo192.png', // Default image for social sharing
    twitterHandle: '@blogauthor',
    language: 'en',
    robots: 'index, follow'
  },

  // SEO settings for different pages
  pages: {
    home: {
      title: 'Blog Home',
      description: 'Welcome to our blog - discover insightful articles and posts',
      keywords: 'blog, articles, posts, insights, content, home'
    },
    loading: {
      title: 'Loading...',
      description: 'Loading content, please wait...'
    },
    error: {
      title: 'Error',
      description: 'An error occurred while loading the content'
    },
    notFound: {
      title: 'Page Not Found',
      description: 'The requested page could not be found'
    }
  },

  // Social media settings
  social: {
    facebook: {
      appId: '', // Add your Facebook App ID if you have one
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      site: '@blogauthor',
      creator: '@blogauthor'
    },
    linkedin: {
      type: 'article'
    }
  },

  // Structured data settings
  structuredData: {
    organization: {
      name: 'Sample Blog Page',
      url: 'http://localhost:3000',
      logo: 'http://localhost:3000/logo192.png',
      sameAs: [
        'https://twitter.com/blogauthor',
        'https://linkedin.com/in/blogauthor'
      ]
    },
    website: {
      name: 'Sample Blog Page',
      url: 'http://localhost:3000',
      description: 'A showcase of blog posts and articles'
    }
  },

  // AI Integration settings
  ai: {
    enabled: true,
    model: 'gpt-3.5-turbo',
    maxTokens: 300,
    temperature: 0.7,
    fallbackEnabled: true
  },

  // Helper functions for generating SEO content with AI integration
  helpers: {
    // Generate title for blog list page
    generateListTitle: (config) => {
      return `${config.display.title} - ${config.user.username}'s Blog`;
    },

    // Generate description for blog list page
    generateListDescription: (config, postsCount) => {
      return `${config.display.subtitle} by ${config.user.username}. Explore ${postsCount} insightful blog posts covering various topics and insights.`;
    },

    // Generate keywords for blog list page
    generateListKeywords: (config) => {
      return `blog, ${config.user.username}, articles, posts, insights, ${config.display.title.toLowerCase()}`;
    },

    // Generate title for individual blog post (with AI optimization)
    generatePostTitle: async (postTitle, config) => {
      if (seoConfig.ai.enabled && seoAIService.isAvailable()) {
        try {
          const optimizedTitle = await seoAIService.generateOptimizedTitle(postTitle, '', 60);
          return `${optimizedTitle} - ${config.user.username}'s Blog`;
        } catch (error) {
          console.error('Error generating AI-optimized title:', error);
        }
      }
      return `${postTitle} - ${config.user.username}'s Blog`;
    },

    // Generate description for individual blog post (with AI optimization)
    generatePostDescription: async (post, config) => {
      if (post.metaDescription) {
        return post.metaDescription;
      }

      if (seoConfig.ai.enabled && seoAIService.isAvailable()) {
        try {
          return await seoAIService.generateMetaDescription(post.content, post.title, 160);
        } catch (error) {
          console.error('Error generating AI-optimized description:', error);
        }
      }

      return `${post.title} by ${config.user.username}. ${post.content.substring(0, 150)}...`;
    },

    // Extract keywords from post content (with AI optimization)
    extractKeywords: async (post) => {
      if (seoConfig.ai.enabled && seoAIService.isAvailable()) {
        try {
          return await seoAIService.generateKeywords(post.content, post.title, 10);
        } catch (error) {
          console.error('Error generating AI-optimized keywords:', error);
        }
      }

      // Fallback to basic keyword extraction
      const titleWords = post.title.toLowerCase().split(' ').filter(word => word.length > 3);
      const contentWords = post.content.toLowerCase().split(' ').filter(word => word.length > 3);
      return [...new Set([...titleWords, ...contentWords.slice(0, 10)])].join(', ');
    },

    // Generate comprehensive SEO data for a post
    generateComprehensiveSEO: async (post, config) => {
      if (seoConfig.ai.enabled && seoAIService.isAvailable()) {
        try {
          return await seoAIService.generateComprehensiveSEO(post, config);
        } catch (error) {
          console.error('Error generating comprehensive SEO:', error);
        }
      }

      // Fallback to basic SEO generation
      return {
        metaDescription: seoConfig.helpers.generatePostDescription(post, config),
        keywords: await seoConfig.helpers.extractKeywords(post),
        socialTitle: post.title,
        socialDescription: `${post.title} by ${config.user.username}`,
        structuredDescription: `${post.title} - ${post.content.substring(0, 150)}...`,
        primaryKeyword: post.title.split(' ').slice(0, 3).join(' '),
        secondaryKeywords: post.title.split(' ').slice(3, 8),
        searchIntent: 'Informational',
        contentType: 'Article',
        generatedByAI: false,
        timestamp: new Date().toISOString()
      };
    },

    // Generate social media description (with AI optimization)
    generateSocialDescription: async (post, config, platform = 'general') => {
      if (seoConfig.ai.enabled && seoAIService.isAvailable()) {
        try {
          return await seoAIService.generateSocialDescription(post.content, post.title, platform, 200);
        } catch (error) {
          console.error('Error generating AI-optimized social description:', error);
        }
      }

      return `${post.title} by ${config.user.username}. ${post.content.substring(0, 150)}...`;
    },

    // Generate canonical URL
    generateCanonicalUrl: (path) => {
      return `${window.location.origin}${path}`;
    },

    // Generate Open Graph data
    generateOpenGraph: (seoData, config) => {
      return {
        type: seoData.type || 'website',
        url: seoData.url,
        title: seoData.title,
        description: seoData.description,
        siteName: config.display.title,
        image: seoData.image || seoConfig.default.image,
        author: seoData.author
      };
    },

    // Generate Twitter Card data
    generateTwitterCard: (seoData) => {
      return {
        card: 'summary_large_image',
        url: seoData.url,
        title: seoData.title,
        description: seoData.description,
        image: seoData.image || seoConfig.default.image
      };
    },

    // Generate structured data for blog post
    generateBlogPostStructuredData: async (post, seoData, config) => {
      const structuredDescription = seoConfig.ai.enabled && seoAIService.isAvailable() 
        ? await seoAIService.generateStructuredDescription(post.content, post.title, 200)
        : seoData.description;

      return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": structuredDescription,
        "author": {
          "@type": "Person",
          "name": seoData.author
        },
        "datePublished": seoData.publishedTime,
        "dateModified": seoData.modifiedTime,
        "publisher": {
          "@type": "Organization",
          "name": config.display.title,
          "url": window.location.origin
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": seoData.url
        },
        "image": seoData.image || seoConfig.default.image,
        "keywords": seoData.keywords
      };
    },

    // Generate structured data for website
    generateWebsiteStructuredData: (config) => {
      return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": config.display.title,
        "url": window.location.origin,
        "description": config.display.subtitle,
        "author": {
          "@type": "Person",
          "name": config.user.username
        },
        "publisher": {
          "@type": "Organization",
          "name": config.display.title,
          "url": window.location.origin
        }
      };
    }
  },

  // Meta tags configuration
  metaTags: {
    // Basic meta tags
    basic: (seoData) => [
      { name: 'description', content: seoData.description },
      { name: 'keywords', content: seoData.keywords },
      { name: 'author', content: seoData.author },
      { name: 'robots', content: seoData.robots || seoConfig.default.robots },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],

    // Open Graph meta tags
    openGraph: (ogData) => [
      { property: 'og:type', content: ogData.type },
      { property: 'og:url', content: ogData.url },
      { property: 'og:title', content: ogData.title },
      { property: 'og:description', content: ogData.description },
      { property: 'og:site_name', content: ogData.siteName },
      { property: 'og:image', content: ogData.image },
      { property: 'og:author', content: ogData.author }
    ],

    // Twitter Card meta tags
    twitter: (twitterData) => [
      { property: 'twitter:card', content: twitterData.card },
      { property: 'twitter:url', content: twitterData.url },
      { property: 'twitter:title', content: twitterData.title },
      { property: 'twitter:description', content: twitterData.description },
      { property: 'twitter:image', content: twitterData.image }
    ],

    // Article-specific meta tags
    article: (seoData) => [
      { property: 'article:published_time', content: seoData.publishedTime },
      { property: 'article:modified_time', content: seoData.modifiedTime },
      { property: 'article:author', content: seoData.author }
    ]
  }
};

export default seoConfig; 