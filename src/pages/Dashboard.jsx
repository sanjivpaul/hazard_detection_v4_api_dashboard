import { AlertTriangle, Video, Activity, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Mock statistics
  const stats = [
    {
      title: 'Active Hazards',
      value: '3',
      change: '+2 from yesterday',
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
      value: '127',
      change: '+12% this week',
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

  const recentHazards = [
    {
      id: 1,
      type: 'Fire Hazard',
      location: 'Warehouse - Section A',
      time: '10:30 AM',
      severity: 'High',
    },
    {
      id: 2,
      type: 'Spill Hazard',
      location: 'Loading Dock',
      time: '8:45 AM',
      severity: 'High',
    },
    {
      id: 3,
      type: 'Unauthorized Access',
      location: 'Main Entrance',
      time: '9:15 AM',
      severity: 'Medium',
    },
  ];

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
            {recentHazards.map((hazard) => (
              <div
                key={hazard.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle
                    className="text-red-500"
                    size={20}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {hazard.type}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {hazard.location}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {hazard.time}
                  </p>
                  <span
                    className={`text-xs font-semibold ${
                      hazard.severity === 'High'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`}
                  >
                    {hazard.severity}
                  </span>
                </div>
              </div>
            ))}
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
