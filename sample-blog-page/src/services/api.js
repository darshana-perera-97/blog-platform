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
  // Get all posts (this will return user-specific posts from the backend)
  getAllPosts: () => api.get('/posts'),
  
  // Get a specific post by ID
  getPost: (id) => api.get(`/posts/${id}`),
  
  // Get user information (if needed)
  getUserInfo: () => api.get(`/auth/me`),
};

export default api; 