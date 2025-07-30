// Utility functions for image handling

// Generate a placeholder image URL based on post title and content
function generatePlaceholderImage(title, content = '') {
  // Use a service like Picsum Photos for placeholder images
  // We'll use a hash of the title to get consistent images for the same title
  const hash = simpleHash(title);
  const width = 800;
  const height = 400;
  
  // Use Picsum Photos with a seed based on the title hash
  return `https://picsum.photos/seed/${hash}/${width}/${height}`;
}

// Simple hash function to generate consistent seeds
function simpleHash(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash);
}

// Get image URL for a post (generated image or placeholder)
function getPostImageUrl(post) {
  if (post.imageUrl) {
    // If it's already a full URL, return as is
    if (post.imageUrl.startsWith('http')) {
      return post.imageUrl;
    }
    
    // If it's a local path, make it a full URL
    if (post.imageUrl.startsWith('/blog_images/')) {
      return `http://localhost:3033${post.imageUrl}`;
    }
    
    return post.imageUrl;
  }
  
  // Generate placeholder based on title
  return generatePlaceholderImage(post.title, post.content);
}

// Validate image URL
function isValidImageUrl(url) {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

module.exports = {
  generatePlaceholderImage,
  getPostImageUrl,
  isValidImageUrl,
  simpleHash
}; 