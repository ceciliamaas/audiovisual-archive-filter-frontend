import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API service methods
export const archiveAPI = {
  // Health check
  getStatus: async () => {
    const response = await api.get('/status');
    return response.data;
  },

  // Search by text query
  searchByText: async ({ query, searchFrames = true, searchObjects = true, maxResults = 10 }) => {
    const response = await api.post('/search/text', {
      query,
      search_frames: searchFrames,
      search_objects: searchObjects,
      max_results: maxResults,
    });
    return response.data;
  },

  // Search by image
  searchByImage: async (imageFile, maxResults = 10) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('max_results', maxResults);

    const response = await api.post('/search/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all videos metadata
  getVideos: async () => {
    const response = await api.get('/videos');
    return response.data;
  },

  // Get storage info
  getStorageInfo: async () => {
    const response = await api.get('/storage/info');
    return response.data;
  },
};

export default api;
