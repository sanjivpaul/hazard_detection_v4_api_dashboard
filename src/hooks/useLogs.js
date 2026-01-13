import { useState, useEffect } from 'react';
import { logsAPI } from '../services/api';

/**
 * Custom hook to fetch and parse logs, extracting only hazard-related entries
 */
export const useLogs = () => {
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await logsAPI.getAll();
        const logs = response.logs || [];
        
        // Parse logs and extract only hazard-related entries
        const parsedHazards = logs
          .map((logEntry) => {
            // Log format: "2026-01-12 20:59:46,212 | WARNING | {...}"
            const parts = logEntry.split(' | ');
            if (parts.length < 3) return null;
            
            const timestamp = parts[0].trim();
            const level = parts[1].trim();
            const message = parts.slice(2).join(' | ').trim();
            
            // Only process WARNING level logs that contain hazard data
            // Also check for INFO level logs that might contain hazard data in some formats
            if ((level === 'WARNING' || level === 'INFO') && message.includes('hazard_detected')) {
              try {
                // Extract JSON from the message - handle both single-line and multi-line JSON
                const jsonMatch = message.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const hazardData = JSON.parse(jsonMatch[0]);
                  
                  // Only include if hazard_detected is true
                  if (hazardData.hazard_detected === true) {
                    return {
                      id: `${timestamp}-${hazardData.hazard_type || Math.random()}`,
                      timestamp,
                      type: hazardData.hazard_type || 'Unknown Hazard',
                      severity: (hazardData.severity || 'Unknown').toLowerCase(),
                      confidence: hazardData.confidence || 0,
                      description: hazardData.description || '',
                      raw: hazardData,
                    };
                  }
                }
              } catch (e) {
                // Skip invalid JSON entries silently (they're not hazards)
                return null;
              }
            }
            
            return null;
          })
          .filter((hazard) => hazard !== null)
          .sort((a, b) => {
            // Sort by timestamp (newest first)
            return new Date(b.timestamp) - new Date(a.timestamp);
          });
        
        setHazards(parsedHazards);
      } catch (err) {
        console.error('Failed to fetch logs:', err);
        setError(err.message || 'Failed to fetch logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    
    // Refresh logs every 30 seconds
    const interval = setInterval(fetchLogs, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { hazards, loading, error };
};
