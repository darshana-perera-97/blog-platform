const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

class ImageStorage {
  constructor() {
    this.imagesDir = path.join(__dirname, '..', 'blog_images');
    this.ensureImagesDirectory();
  }

  async ensureImagesDirectory() {
    try {
      await fsPromises.access(this.imagesDir);
    } catch (error) {
      // Directory doesn't exist, create it
      await fsPromises.mkdir(this.imagesDir, { recursive: true });
      console.log('📁 Created blog_images directory');
    }
  }

  async downloadImage(imageUrl, filename) {
    return new Promise((resolve, reject) => {
      const url = new URL(imageUrl);
      const protocol = url.protocol === 'https:' ? https : http;
      
      const filePath = path.join(this.imagesDir, filename);
      
      const file = fs.createWriteStream(filePath);
      
      const request = protocol.get(imageUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`✅ Image downloaded: ${filename}`);
          resolve(`/blog_images/${filename}`);
        });
        
        file.on('error', (err) => {
          fsPromises.unlink(filePath).catch(() => {}); // Delete the file if it exists
          reject(err);
        });
      });
      
      request.on('error', (err) => {
        reject(err);
      });
      
      request.setTimeout(30000, () => {
        request.destroy();
        reject(new Error('Download timeout'));
      });
    });
  }

  async saveGeneratedImage(imageUrl, postId, title) {
    try {
      // Create a safe filename
      const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
      const timestamp = Date.now();
      const filename = `post_${postId}_${safeTitle}_${timestamp}.jpg`;
      
      // Download and save the image
      const localPath = await this.downloadImage(imageUrl, filename);
      
      return localPath;
    } catch (error) {
      console.error('❌ Failed to save image:', error.message);
      throw error;
    }
  }

  async deleteImage(imagePath) {
    try {
      if (imagePath && imagePath.startsWith('/blog_images/')) {
        const filename = path.basename(imagePath);
        const filePath = path.join(this.imagesDir, filename);
        await fsPromises.unlink(filePath);
        console.log(`🗑️ Deleted image: ${filename}`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to delete image:', error.message);
    }
  }

  getImagePath(filename) {
    return path.join(this.imagesDir, filename);
  }
}

module.exports = new ImageStorage(); 