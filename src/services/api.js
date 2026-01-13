import { API_BASE_URL } from '../utils/constants';

/**
 * Get the API URL - use relative URL in development to go through Vite proxy
 * This avoids CORS issues since the proxy handles it
 */
const getApiUrl = (endpoint) => {
  // In development, use relative URL to go through Vite proxy
  if (import.meta.env.DEV) {
    // Vite proxy is configured for /api, so we need to construct the path
    // API_BASE_URL is http://localhost:8000/api/v1
    // We want /api/v1/endpoint to go through the proxy
    try {
      const url = new URL(API_BASE_URL);
      const basePath = url.pathname; // This gives us /api/v1
      return `${basePath}${endpoint}`;
    } catch (e) {
      // Fallback: extract path manually
      const match = API_BASE_URL.match(/https?:\/\/[^/]+(\/.*)/);
      if (match) {
        return `${match[1]}${endpoint}`;
      }
      // Last resort: use full URL
      return `${API_BASE_URL}${endpoint}`;
    }
  }
  // In production, use full URL
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Generic API request handler
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

/**
 * Hazard API methods
 */
export const hazardAPI = {
  getAll: () => apiRequest('/hazards'),
  getById: (id) => apiRequest(`/hazards/${id}`),
  create: (data) => apiRequest('/hazards', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/hazards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/hazards/${id}`, { method: 'DELETE' }),
};

/**
 * CCTV API methods
 */
export const cctvAPI = {
  getChannels: () => apiRequest('/cctv/channels'),
  getStreamUrl: (channelId) => apiRequest(`/cctv/stream/${channelId}`),
};

/**
 * Settings API methods
 */
export const settingsAPI = {
  get: () => apiRequest('/settings'),
  update: (data) => apiRequest('/settings', { method: 'PUT', body: JSON.stringify(data) }),
};

/**
 * Logs API methods
 */
export const logsAPI = {
  getAll: () => apiRequest('/logs'),
};
