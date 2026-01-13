import { useState, useEffect } from 'react';
// import { cctvAPI } from '../services/api'; // Uncomment when API is ready

/**
 * Custom hook for managing CCTV channels
 */
export const useCCTVChannels = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        // Uncomment when API is ready:
        // const data = await cctvAPI.getChannels();
        // setChannels(data);
        
        // For now, using mock data
        setChannels([]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  return { channels, loading, error, setChannels };
};
