import { API_BASE_URL } from '../utils/constants';

/**
 * Generic API request handler
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
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
