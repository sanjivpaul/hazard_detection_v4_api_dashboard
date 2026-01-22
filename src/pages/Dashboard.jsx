import { useState, useEffect } from 'react';
import { AlertTriangle, Video, Activity, TrendingUp, Clock, Play, Power, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLogs } from '../hooks/useLogs';
import { useDetectionInterval, DETECTION_INTERVAL_LABELS } from '../hooks/useDetectionInterval';
import { format } from 'date-fns';

// Available cameras for detection
const AVAILABLE_CAMERAS = [
  { id: 'channel_1', name: 'Channel 1' },
  { id: 'channel_2', name: 'Channel 2' },
];

const CAMERA_STORAGE_KEY = 'hazard_detection_camera';

const Dashboard = () => {
  const { hazards, loading: hazardsLoading } = useLogs();
  
  // Get initial camera from localStorage or default to channel_1
  const getInitialCamera = () => {
    try {
      const stored = localStorage.getItem(CAMERA_STORAGE_KEY);
      if (stored && AVAILABLE_CAMERAS.find(c => c.id === stored)) {
        return stored;
      }
    } catch (e) {
      console.warn('Failed to read camera from localStorage:', e);
    }
    return 'channel_1'; // Default to channel_1
  };
  
  const [selectedCamera, setSelectedCamera] = useState(getInitialCamera);
  
  // Save camera selection to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CAMERA_STORAGE_KEY, selectedCamera);
      console.log('Saved camera selection to localStorage:', selectedCamera);
    } catch (e) {
      console.warn('Failed to save camera selection to localStorage:', e);
    }
  }, [selectedCamera]);
  
  const {
    interval: detectionInterval,
    setInterval: setDetectionInterval,
    isEnabled: detectionEnabled,
    setIsEnabled: setDetectionEnabled,
    isDetecting,
    lastDetection,
    error: detectionError,
    manualTrigger,
    intervalLabel,
    availableIntervals,
  } = useDetectionInterval(selectedCamera);

  // Calculate statistics from real data
  const stats = [
    {
      title: 'Active Hazards',
      value: hazards.length.toString(),
      change: hazards.length > 0 ? `${hazards.filter(h => h.severity.toLowerCase() === 'high').length} high severity` : 'No active hazards',
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    {
      title: 'CCTV Channels',
      value: '4',
      change: 'All operational',
      icon: Video,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Total Detections',
      value: hazards.length.toString(),
      change: hazards.length > 0 ? `Latest: ${hazards[0]?.type || 'N/A'}` : 'No detections yet',
      icon: Activity,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Detection Interval',
      value: detectionEnabled ? intervalLabel : 'Disabled',
      change: detectionEnabled
        ? lastDetection
          ? `Last: ${format(lastDetection, 'h:mm a')}`
          : isDetecting
          ? 'Detecting...'
          : 'Not started'
        : 'Detection is disabled',
      icon: Clock,
      color: detectionEnabled ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-500',
      bgColor: detectionEnabled ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-800/50',
    },
  ];

  // Format recent hazards from logs (show latest 5)
  const recentHazards = hazards.slice(0, 5).map((hazard) => {
    // Parse timestamp and format time
    // Timestamp format: "2026-01-12 20:59:46,212"
    let timeStr = 'Unknown';
    try {
      // Replace comma with dot for milliseconds, then parse
      const normalizedTimestamp = hazard.timestamp.replace(',', '.');
      const date = new Date(normalizedTimestamp);
      
      if (!isNaN(date.getTime())) {
        timeStr = format(date, 'h:mm a');
      } else {
        // Fallback: extract time directly from string
        const timeMatch = hazard.timestamp.match(/(\d{2}):(\d{2}):(\d{2})/);
        if (timeMatch) {
          const [, hours, minutes] = timeMatch;
          const hour12 = parseInt(hours) % 12 || 12;
          const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
          timeStr = `${hour12}:${minutes} ${ampm}`;
        }
      }
    } catch (e) {
      // If all parsing fails, try to extract time from timestamp string
      const timeMatch = hazard.timestamp.match(/(\d{2}):(\d{2}):(\d{2})/);
      if (timeMatch) {
        const [, hours, minutes] = timeMatch;
        const hour12 = parseInt(hours) % 12 || 12;
        const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
        timeStr = `${hour12}:${minutes} ${ampm}`;
      }
    }

    // Capitalize severity properly
    const severity = hazard.severity.charAt(0).toUpperCase() + hazard.severity.slice(1).toLowerCase();

    return {
      id: hazard.id,
      type: hazard.type,
      description: hazard.description,
      time: timeStr,
      severity,
      confidence: hazard.confidence,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Overview of your hazard detection system
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-lg shadow p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {stat.change}
                  </p>
                </div>
                <div
                  className={`${stat.bgColor} p-3 rounded-lg`}
                >
                  <Icon className={stat.color} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Hazards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Hazards
            </h2>
            <Link
              to="/hazards"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {hazardsLoading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Loading hazards...
              </div>
            ) : recentHazards.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No hazards detected yet
              </div>
            ) : (
              recentHazards.map((hazard) => (
                <div
                  key={hazard.id}
                  className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <AlertTriangle
                      className={`mt-0.5 ${
                        hazard.severity.toLowerCase() === 'high'
                          ? 'text-red-500'
                          : hazard.severity.toLowerCase() === 'medium'
                          ? 'text-yellow-500'
                          : 'text-orange-500'
                      }`}
                      size={20}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {hazard.type}
                      </p>
                      {hazard.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {hazard.description}
                        </p>
                      )}
                      {hazard.confidence && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Confidence: {hazard.confidence}%
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {hazard.time}
                    </p>
                    <span
                      className={`text-xs font-semibold inline-block mt-1 ${
                        hazard.severity.toLowerCase() === 'high'
                          ? 'text-red-600 dark:text-red-400'
                          : hazard.severity.toLowerCase() === 'medium'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-orange-600 dark:text-orange-400'
                      }`}
                    >
                      {hazard.severity}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detection Control */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Detection Control
            </h2>
            {/* Enable/Disable Toggle */}
            <button
              onClick={() => setDetectionEnabled(!detectionEnabled)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                detectionEnabled
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Power size={18} className={detectionEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'} />
              <span className="text-sm font-medium">
                {detectionEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </button>
          </div>
          
          {/* Detection Interval Selector */}
          <div className="space-y-4">
            {/* Camera Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Camera size={16} className="inline mr-2" />
                Camera Channel
              </label>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                disabled={isDetecting}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {AVAILABLE_CAMERAS.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Select which camera channel to use for hazard detection
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Detection Interval
              </label>
              <select
                value={detectionInterval}
                onChange={(e) => setDetectionInterval(e.target.value)}
                disabled={isDetecting || !detectionEnabled}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {availableIntervals.map((intervalKey) => (
                  <option key={intervalKey} value={intervalKey}>
                    {DETECTION_INTERVAL_LABELS[intervalKey]}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {!detectionEnabled
                  ? 'Detection is disabled. Enable to start automatic detection.'
                  : detectionInterval === 'auto'
                  ? 'Automatic detection based on system settings'
                  : `Hazards will be detected every ${intervalLabel.toLowerCase()}`}
              </p>
            </div>

            {/* Current Status */}
            <div className={`p-3 rounded-lg ${
              detectionEnabled 
                ? 'bg-gray-50 dark:bg-gray-800' 
                : 'bg-gray-100 dark:bg-gray-800/50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                    {detectionEnabled ? (
                      <>
                        <span className="text-green-600 dark:text-green-400">Active</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">• {intervalLabel}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">• {AVAILABLE_CAMERAS.find(c => c.id === selectedCamera)?.name || selectedCamera}</span>
                      </>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">Inactive</span>
                    )}
                  </p>
                </div>
                {isDetecting && (
                  <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"></div>
                    <span className="text-xs">Detecting...</span>
                  </div>
                )}
              </div>
              {lastDetection && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Last detection: {format(lastDetection, 'MMM dd, yyyy h:mm:ss a')}
                </p>
              )}
              {detectionError && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                  Error: {detectionError}
                </p>
              )}
            </div>

            {/* Manual Trigger Button */}
            <button
              onClick={manualTrigger}
              disabled={isDetecting || !detectionEnabled}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={18} />
              <span>
                {isDetecting 
                  ? 'Detecting...' 
                  : !detectionEnabled
                  ? 'Enable Detection to Trigger'
                  : 'Trigger Detection Now'}
              </span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                to="/cctv"
                className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <Video className="text-primary-600 dark:text-primary-400" size={18} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  View CCTV Feeds
                </span>
              </Link>
              <Link
                to="/hazards"
                className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <AlertTriangle className="text-red-500" size={18} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  View Hazard Logs
                </span>
              </Link>
              <Link
                to="/settings"
                className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <Activity className="text-primary-600 dark:text-primary-400" size={18} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  System Settings
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
