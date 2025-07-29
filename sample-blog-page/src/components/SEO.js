import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import seoConfig from '../seo-config';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  author, 
  type = 'website', 
  url, 
  image, 
  publishedTime, 
  modifiedTime,
  structuredData,
  children,
  loading = false
}) => {
  // Use provided values or fall back to defaults
  const seoData = {
    title: title || seoConfig.default.title,
    description: description || seoConfig.default.description,
    keywords: keywords || seoConfig.default.keywords,
    author: author || seoConfig.default.author,
    type: type,
    url: url || window.location.href,
    image: image || seoConfig.default.image,
    publishedTime,
    modifiedTime,
    robots: seoConfig.default.robots
  };

  // Generate Open Graph data
  const ogData = seoConfig.helpers.generateOpenGraph(seoData, {
    display: { title: seoConfig.default.siteName }
  });

  // Generate Twitter Card data
  const twitterData = seoConfig.helpers.generateTwitterCard(seoData);

  if (loading) {
    return (
      <Helmet>
        <title>Loading... - {seoConfig.default.title}</title>
        <meta name="description" content="Loading content..." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
    );
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoData.title}</title>
      {seoConfig.metaTags.basic(seoData).map((tag, index) => (
        <meta key={`basic-${index}`} name={tag.name} content={tag.content} />
      ))}

      {/* Open Graph Meta Tags */}
      {seoConfig.metaTags.openGraph(ogData).map((tag, index) => (
        <meta key={`og-${index}`} property={tag.property} content={tag.content} />
      ))}

      {/* Twitter Card Meta Tags */}
      {seoConfig.metaTags.twitter(twitterData).map((tag, index) => (
        <meta key={`twitter-${index}`} property={tag.property} content={tag.content} />
      ))}

      {/* Article-specific Meta Tags (if type is article) */}
      {type === 'article' && seoConfig.metaTags.article(seoData).map((tag, index) => (
        <meta key={`article-${index}`} property={tag.property} content={tag.content} />
      ))}

      {/* Canonical URL */}
      <link rel="canonical" href={seoData.url} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* Additional children (for custom meta tags) */}
      {children}
    </Helmet>
  );
};

// Async SEO component for AI-generated content
const AsyncSEO = ({ post, config, children }) => {
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateSEO = async () => {
      try {
        setLoading(true);
        const comprehensiveSEO = await seoConfig.helpers.generateComprehensiveSEO(post, config);
        setSeoData(comprehensiveSEO);
      } catch (err) {
        console.error('Error generating SEO:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (post && config) {
      generateSEO();
    }
  }, [post, config]);

  if (loading) {
    return <SEO loading={true} />;
  }

  if (error) {
    // Fallback to basic SEO
    return (
      <SEO
        title={`${post.title} - ${config.user.username}'s Blog`}
        description={post.metaDescription || `${post.title} by ${config.user.username}`}
        keywords={seoConfig.helpers.extractKeywords(post)}
        author={config.user.username}
        type="article"
        url={`${window.location.origin}/post/${post.id}`}
        publishedTime={post.createdAt}
        modifiedTime={post.updatedAt}
      >
        {children}
      </SEO>
    );
  }

  return (
    <SEO
      title={`${seoData.socialTitle} - ${config.user.username}'s Blog`}
      description={seoData.metaDescription}
      keywords={seoData.keywords}
      author={config.user.username}
      type="article"
      url={`${window.location.origin}/post/${post.id}`}
      publishedTime={post.createdAt}
      modifiedTime={post.updatedAt}
      structuredData={seoConfig.helpers.generateBlogPostStructuredData(post, seoData, config)}
    >
      {children}
    </SEO>
  );
};

// Predefined SEO components for common use cases
export const BlogListSEO = ({ config, postsCount }) => {
  const seoData = {
    title: seoConfig.helpers.generateListTitle(config),
    description: seoConfig.helpers.generateListDescription(config, postsCount),
    keywords: seoConfig.helpers.generateListKeywords(config),
    author: config.user.username,
    url: seoConfig.helpers.generateCanonicalUrl('/'),
    type: 'website'
  };

  const structuredData = seoConfig.helpers.generateWebsiteStructuredData(config);

  return (
    <SEO {...seoData} structuredData={structuredData} />
  );
};

export const BlogPostSEO = ({ post, config }) => {
  // Use AsyncSEO for AI-powered SEO generation
  return <AsyncSEO post={post} config={config} />;
};

export const LoadingSEO = ({ config }) => {
  const seoData = {
    title: `${seoConfig.pages.loading.title} - ${config.display.title}`,
    description: seoConfig.pages.loading.description,
    type: 'website'
  };

  return <SEO {...seoData} />;
};

export const ErrorSEO = ({ config, errorType = 'error' }) => {
  const pageConfig = seoConfig.pages[errorType] || seoConfig.pages.error;
  const seoData = {
    title: `${pageConfig.title} - ${config.display.title}`,
    description: pageConfig.description,
    type: 'website'
  };

  return <SEO {...seoData} />;
};

// AI-powered SEO components
export const AIBlogPostSEO = ({ post, config }) => {
  return <AsyncSEO post={post} config={config} />;
};

export const AIComprehensiveSEO = ({ post, config, onSEOGenerated }) => {
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateSEO = async () => {
      try {
        setLoading(true);
        const comprehensiveSEO = await seoConfig.helpers.generateComprehensiveSEO(post, config);
        setSeoData(comprehensiveSEO);
        if (onSEOGenerated) {
          onSEOGenerated(comprehensiveSEO);
        }
      } catch (err) {
        console.error('Error generating comprehensive SEO:', err);
      } finally {
        setLoading(false);
      }
    };

    if (post && config) {
      generateSEO();
    }
  }, [post, config, onSEOGenerated]);

  if (loading || !seoData) {
    return <SEO loading={true} />;
  }

  return (
    <SEO
      title={`${seoData.socialTitle} - ${config.user.username}'s Blog`}
      description={seoData.metaDescription}
      keywords={seoData.keywords}
      author={config.user.username}
      type="article"
      url={`${window.location.origin}/post/${post.id}`}
      publishedTime={post.createdAt}
      modifiedTime={post.updatedAt}
      structuredData={seoConfig.helpers.generateBlogPostStructuredData(post, seoData, config)}
    />
  );
};

export default SEO; 