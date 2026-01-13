import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Bell, Shield, Database } from 'lucide-react';
import { useState } from 'react';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your application preferences
        </p>
      </div>

      {/* Theme Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          {theme === 'dark' ? (
            <Moon className="text-primary-600 dark:text-primary-400" size={24} />
          ) : (
            <Sun className="text-primary-600 dark:text-primary-400" size={24} />
          )}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Appearance
          </h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Theme
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Switch between light and dark mode
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            {theme === 'dark' ? (
              <>
                <Sun size={18} />
                Light Mode
              </>
            ) : (
              <>
                <Moon size={18} />
                Dark Mode
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="text-primary-600 dark:text-primary-400" size={24} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Notifications
          </h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Push Notifications
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Receive real-time alerts for detected hazards
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Email Alerts
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Receive email notifications for critical hazards
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="text-primary-600 dark:text-primary-400" size={24} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            System
          </h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Auto-save Logs
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Automatically save hazard logs to database
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="text-primary-600 dark:text-primary-400" size={24} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Security
          </h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              defaultValue={30}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium">
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
