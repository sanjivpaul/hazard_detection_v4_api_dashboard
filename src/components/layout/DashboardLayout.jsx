import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto lg:ml-0">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
