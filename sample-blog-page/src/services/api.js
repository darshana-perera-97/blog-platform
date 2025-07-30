import axios from 'axios';
import config from '../config';

// Create axios instance with base URL from config
const api = axios.create({
  baseURL: config.backendUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service for blog posts
export const blogAPI = {
  // Get all posts (this will return public posts from the backend)
  // The frontend will filter for the configured user's published posts
  getAllPosts: () => api.get('/posts'),
  
  // Get a specific post by ID
  // The frontend will verify it belongs to the configured user and is published
  getPost: (id) => api.get(`/posts/${id}`),
  
  // Get user information (if needed)
  getUserInfo: () => api.get(`/auth/me`),
};

export default api; 