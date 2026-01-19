/**
 * Get the URL for a hazard image
 * The image path from the backend is relative (e.g., "app/data/incidents/image.jpg")
 * We need to construct a URL that goes through the proxy to the backend
 */
export const getHazardImageUrl = (imagePath) => {
  if (!imagePath) {
    return null;
  }

  // If it's already a full URL, return it as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // The backend path is like "app/data/incidents/image.jpg"
  // We need to serve it through the API proxy
  // In development, use relative URL to go through Vite proxy
  // In production, use full API URL
  
  if (import.meta.env.DEV) {
    // Use relative URL to go through Vite proxy
    // The proxy is configured for /api, so we'll create an endpoint for images
    // For now, we'll try to access it directly through the backend
    // Since the path is "app/data/incidents/...", we need to map it to the backend
    // Assuming the backend serves static files from a specific route
    
    // Option 1: If backend serves images at /api/v1/images/...
    // Option 2: If backend serves static files, we might need a different approach
    
    // For now, let's create a proxy-friendly path
    // We'll need to add an API endpoint or proxy rule for images
    // Let's use: /api/v1/images?path=app/data/incidents/image.jpg
    const encodedPath = encodeURIComponent(imagePath);
    return `/api/v1/images?path=${encodedPath}`;
  } else {
    // In production, use full API URL
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    const encodedPath = encodeURIComponent(imagePath);
    return `${API_BASE_URL}/images?path=${encodedPath}`;
  }
};

/**
 * Get image URL - handles both full URLs and relative paths
 * Converts full URLs to proxy paths in development to avoid CORS
 */
export const getHazardImageUrlDirect = (imagePath) => {
  if (!imagePath) {
    return null;
  }

  // If it's a full URL (http:// or https://)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    if (import.meta.env.DEV) {
      // In development, convert to proxy path to avoid CORS
      // http://localhost:8000/incidents/image.jpg -> /incidents/image.jpg
      try {
        const url = new URL(imagePath);
        // Extract the pathname (e.g., /incidents/image.jpg)
        return url.pathname;
      } catch (e) {
        // If URL parsing fails, try to extract path manually
        const match = imagePath.match(/https?:\/\/[^/]+(\/.+)/);
        if (match) {
          return match[1]; // Return the path part
        }
        // Fallback: return as-is (might cause CORS issues)
        return imagePath;
      }
    } else {
      // In production, use full URL
      return imagePath;
    }
  }

  // If it's a relative path (e.g., "app/data/incidents/image.jpg")
  if (import.meta.env.DEV) {
    // Try to access through static proxy
    // The vite proxy will forward /static/* to http://localhost:8000/*
    return `/static/${imagePath}`;
  } else {
    // In production, construct full URL
    const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8000';
    return `${API_BASE}/${imagePath}`;
  }
};
