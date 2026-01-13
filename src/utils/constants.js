// Application constants
export const APP_NAME = 'Hazard Detection AI';
export const APP_VERSION = '1.0.0';

// API endpoints (update with your actual API URLs)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://127.0.0.1:8000';

export const API_ENDPOINTS = {
  HAZARDS: '/hazards',
  CCTV_CHANNELS: '/cctv/channels',
  CCTV_STREAM: '/cctv/stream',
  VIDEO: '/video',
  SETTINGS: '/settings',
};

export const WS_ENDPOINTS = {
  VIDEO: '/ws/video',
};

// Hazard severity levels
export const HAZARD_SEVERITY = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

// Hazard status
export const HAZARD_STATUS = {
  ACTIVE: 'Active',
  RESOLVED: 'Resolved',
  INVESTIGATING: 'Investigating',
};

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};
