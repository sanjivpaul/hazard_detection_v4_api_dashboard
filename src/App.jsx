import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import CCTVGrid from './components/cctv/CCTVGrid';
import HazardLogs from './components/hazards/HazardLogs';
import HazardDetails from './pages/HazardDetails';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="cctv" element={<CCTVGrid />} />
            <Route path="hazards" element={<HazardLogs />} />
            <Route path="hazards/:id" element={<HazardDetails />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
