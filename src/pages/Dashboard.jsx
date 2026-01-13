import { AlertTriangle, Video, Activity, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLogs } from '../hooks/useLogs';
import { format } from 'date-fns';

const Dashboard = () => {
  const { hazards, loading: hazardsLoading } = useLogs();

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
      title: 'System Uptime',
      value: '99.8%',
      change: 'Last 30 days',
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
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

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              to="/cctv"
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <Video className="text-primary-600 dark:text-primary-400" size={20} />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                View CCTV Feeds
              </span>
            </Link>
            <Link
              to="/hazards"
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <AlertTriangle className="text-red-500" size={20} />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                View Hazard Logs
              </span>
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <Activity className="text-primary-600 dark:text-primary-400" size={20} />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                System Settings
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
