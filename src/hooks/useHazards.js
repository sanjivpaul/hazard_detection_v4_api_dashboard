import { useState, useEffect } from 'react';
// import { hazardAPI } from '../services/api'; // Uncomment when API is ready

/**
 * Custom hook for managing hazards data
 */
export const useHazards = () => {
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHazards = async () => {
      try {
        setLoading(true);
        // Uncomment when API is ready:
        // const data = await hazardAPI.getAll();
        // setHazards(data);
        
        // For now, using mock data
        setHazards([]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHazards();
  }, []);

  return { hazards, loading, error, setHazards };
};
