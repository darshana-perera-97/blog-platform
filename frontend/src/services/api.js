import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:3033/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
};

// Posts API
export const postsAPI = {
  getAllPosts: () => api.get('/posts'),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (postData) => api.post('/posts', postData),
  updatePost: (id, postData) => api.put(`/posts/${id}`, postData),
  deletePost: (id) => api.delete(`/posts/${id}`),
  publishPost: (id, isPublic) => api.patch(`/posts/${id}/publish`, { isPublic }),
};

// Prompts API
export const promptsAPI = {
  getAllPrompts: () => api.get('/prompts'),
  getUserPrompts: () => api.get('/prompts/my-prompts'),
  getPrompt: (id) => api.get(`/prompts/${id}`),
  createPrompt: (promptData) => api.post('/prompts', promptData),
  updatePrompt: (id, promptData) => api.put(`/prompts/${id}`, promptData),
  deletePrompt: (id) => api.delete(`/prompts/${id}`),
};

// AI Blog API
export const aiBlogAPI = {
  generateBlog: (data) => api.post('/ai-blog/generate', data),
  getAvailablePrompts: () => api.get('/ai-blog/prompts'),
  getAIStatus: () => api.get('/ai-blog/status'),
};

export default api; 