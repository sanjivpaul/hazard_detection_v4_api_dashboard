import { useState, useEffect, useRef, useCallback } from 'react';
import { detectionAPI } from '../services/api';

// Detection interval options in milliseconds
export const DETECTION_INTERVALS = {
  '1min': 1 * 60 * 1000,        // 1 minute
  '5min': 5 * 60 * 1000,         // 5 minutes
  '30min': 30 * 60 * 1000,      // 30 minutes
  '1hr': 60 * 60 * 1000,        // 1 hour
  'auto': null,                  // Auto detect (no fixed interval)
};

export const DETECTION_INTERVAL_LABELS = {
  '1min': '1 Minute',
  '5min': '5 Minutes',
  '30min': '30 Minutes',
  '1hr': '1 Hour',
  'auto': 'Auto Detect',
};

const STORAGE_KEY = 'hazard_detection_interval';
const ENABLED_STORAGE_KEY = 'hazard_detection_enabled';

/**
 * Custom hook for managing hazard detection intervals
 * @param {string} cameraId - The camera ID to use for detection (e.g., 'channel_1', 'channel_2')
 */
const useDetectionInterval = (cameraId = 'channel_1') => {
  // Get initial interval from localStorage or default to '5min'
  const getInitialInterval = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && DETECTION_INTERVALS[stored]) {
        return stored;
      }
    } catch (e) {
      console.warn('Failed to read detection interval from localStorage:', e);
    }
    return '5min'; // Default to 5 minutes
  };

  // Get initial enabled state from localStorage or default to true
  const getInitialEnabled = () => {
    try {
      const stored = localStorage.getItem(ENABLED_STORAGE_KEY);
      if (stored !== null) {
        return stored === 'true';
      }
    } catch (e) {
      console.warn('Failed to read detection enabled state from localStorage:', e);
    }
    return true; // Default to enabled
  };

  const [interval, setIntervalValue] = useState(getInitialInterval);
  const [isEnabled, setIsEnabled] = useState(getInitialEnabled);
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastDetection, setLastDetection] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const initialTimeoutRef = useRef(null);
  const isDetectingRef = useRef(false); // Use ref to track detection state
  const cameraIdRef = useRef(cameraId); // Store cameraId in ref to avoid stale closures

  // Update cameraId ref when it changes
  useEffect(() => {
    cameraIdRef.current = cameraId;
    console.log('Camera ID updated in hook:', cameraId);
  }, [cameraId]);

  // Function to trigger detection
  const triggerDetection = useCallback(async () => {
    // Use a ref to track if detection is in progress to avoid stale closure issues
    if (isDetectingRef.current) {
      console.log('Detection already in progress, skipping...');
      return;
    }

    // Get current cameraId from ref
    const currentCameraId = cameraIdRef.current;
    if (!currentCameraId) {
      console.error('Camera ID is not set, cannot trigger detection');
      setError('Camera ID is required for detection');
      return null;
    }

    try {
      isDetectingRef.current = true;
      setIsDetecting(true);
      setError(null);
      console.log('Triggering hazard detection...');
      console.log('API endpoint: /api/v1/detect/' + currentCameraId);
      console.log('Camera ID:', currentCameraId);
      
      const response = await detectionAPI.detect(currentCameraId);
      setLastDetection(new Date());
      
      console.log('Detection completed successfully:', response);
      return response;
    } catch (err) {
      console.error('Detection failed:', err);
      const errorMessage = err.message || err.toString() || 'Failed to trigger detection';
      setError(errorMessage);
      console.error('Full error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        cameraId: currentCameraId,
      });
      // Don't throw - just set error state
      return null;
    } finally {
      isDetectingRef.current = false;
      setIsDetecting(false);
    }
  }, []); // No dependencies needed since we use refs

  // Save enabled state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ENABLED_STORAGE_KEY, isEnabled.toString());
      console.log('Saved detection enabled state to localStorage:', isEnabled);
    } catch (e) {
      console.warn('Failed to save detection enabled state to localStorage:', e);
    }
  }, [isEnabled]);

  // Set up interval based on selected option
  useEffect(() => {
    console.log('Setting up detection interval:', interval, 'enabled:', isEnabled);
    
    // Clear existing intervals
    if (intervalRef.current) {
      console.log('Clearing existing interval');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (initialTimeoutRef.current) {
      clearTimeout(initialTimeoutRef.current);
      initialTimeoutRef.current = null;
    }

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, interval);
      console.log('Saved interval to localStorage:', interval);
    } catch (e) {
      console.warn('Failed to save detection interval to localStorage:', e);
    }

    // If detection is disabled, don't set up intervals
    if (!isEnabled) {
      console.log('Detection is disabled, not setting up intervals');
      return;
    }

    // If auto detect, don't set up automatic intervals
    if (interval === 'auto') {
      console.log('Auto detect mode: No automatic intervals');
      return;
    }

    // Get interval duration in milliseconds
    const intervalMs = DETECTION_INTERVALS[interval];
    if (!intervalMs) {
      console.warn('Invalid detection interval:', interval);
      return;
    }

    console.log(`Setting up detection with interval: ${DETECTION_INTERVAL_LABELS[interval]} (${intervalMs}ms)`);

    // Trigger immediately on interval change (with a small delay to avoid blocking)
    initialTimeoutRef.current = setTimeout(() => {
      console.log('Triggering initial detection...');
      triggerDetection().catch(err => {
        console.error('Initial detection failed:', err);
      });
    }, 500);

    // Set up recurring interval
    intervalRef.current = setInterval(() => {
      console.log('Interval triggered, calling detection...');
      triggerDetection().catch(err => {
        console.error('Scheduled detection failed:', err);
      });
    }, intervalMs);

    // Cleanup on unmount or interval change
    return () => {
      console.log('Cleaning up detection interval');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (initialTimeoutRef.current) {
        clearTimeout(initialTimeoutRef.current);
        initialTimeoutRef.current = null;
      }
    };
  }, [interval, isEnabled, triggerDetection]); // Added isEnabled to dependencies

  // Manual trigger function (useful for auto mode or manual testing)
  const manualTrigger = useCallback(() => {
    return triggerDetection();
  }, [triggerDetection]);

  return {
    interval,
    setInterval: setIntervalValue,
    isEnabled,
    setIsEnabled,
    isDetecting,
    lastDetection,
    error,
    manualTrigger,
    intervalLabel: DETECTION_INTERVAL_LABELS[interval],
    availableIntervals: Object.keys(DETECTION_INTERVALS),
  };
};

export { useDetectionInterval };
export default useDetectionInterval;
