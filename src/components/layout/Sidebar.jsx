import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Video, 
  AlertTriangle, 
  Settings, 
  Menu,
  X 
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/cctv', icon: Video, label: 'CCTV Feeds' },
  { path: '/hazards', icon: AlertTriangle, label: 'Hazard Logs' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform duration-300 ease-in-out
          h-screen overflow-y-auto
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Hazard Detection
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  <Icon size={20} className="mr-3" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              © 2024 Hazard Detection AI
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
