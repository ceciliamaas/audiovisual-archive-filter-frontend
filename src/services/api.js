import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120 seconds for searches (Replicate API can be slow)
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
  searchByText: async ({ query, searchFrames = true, searchObjects = true, maxResults = 10, videoNames = null }) => {
    const response = await api.post('/api/search/text', {
      query,
      search_frames: searchFrames,
      search_objects: searchObjects,
      max_results: maxResults,
      video_names: videoNames && videoNames.length > 0 ? videoNames : null,
    });
    return response.data;
  },

  // Search by image
  searchByImage: async (imageFile, maxResults = 10, videoNames = null, searchFrames = true, searchObjects = true) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('search_frames', searchFrames);
    formData.append('search_objects', searchObjects);
    formData.append('max_results', maxResults);
    if (videoNames && videoNames.length > 0) {
      formData.append('video_names', videoNames.join(','));
    }

    const response = await api.post('/api/search/image', formData, {
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
