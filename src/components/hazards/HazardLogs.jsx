import { useState, useMemo } from 'react';
import { AlertTriangle, Search, Download } from 'lucide-react';
import { format } from 'date-fns';

// Mock hazard data - replace with actual API data
const mockHazards = [
  {
    id: 1,
    type: 'Fire Hazard',
    severity: 'High',
    location: 'Warehouse - Section A',
    channel: 'Channel 3',
    timestamp: new Date('2024-01-15T10:30:00'),
    status: 'Active',
    description: 'Smoke detected in warehouse section A',
  },
  {
    id: 2,
    type: 'Unauthorized Access',
    severity: 'Medium',
    location: 'Main Entrance',
    channel: 'Channel 1',
    timestamp: new Date('2024-01-15T09:15:00'),
    status: 'Resolved',
    description: 'Unauthorized person detected at main entrance',
  },
  {
    id: 3,
    type: 'Spill Hazard',
    severity: 'High',
    location: 'Loading Dock',
    channel: 'Channel 4',
    timestamp: new Date('2024-01-15T08:45:00'),
    status: 'Active',
    description: 'Liquid spill detected on loading dock',
  },
  {
    id: 4,
    type: 'Equipment Malfunction',
    severity: 'Low',
    location: 'Parking Lot',
    channel: 'Channel 2',
    timestamp: new Date('2024-01-15T07:20:00'),
    status: 'Resolved',
    description: 'Equipment malfunction detected',
  },
];

const severityColors = {
  High: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

const statusColors = {
  Active: 'bg-red-500',
  Resolved: 'bg-green-500',
};

const HazardLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredHazards = useMemo(() => {
    return mockHazards.filter((hazard) => {
      const matchesSearch =
        hazard.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hazard.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hazard.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = severityFilter === 'All' || hazard.severity === severityFilter;
      const matchesStatus = statusFilter === 'All' || hazard.status === statusFilter;
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [searchTerm, severityFilter, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Hazard Logs
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            View and manage detected hazards
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
          <Download size={18} />
          Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search hazards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option>All Severities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option>All Statuses</option>
            <option>Active</option>
            <option>Resolved</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Channel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {filteredHazards.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No hazards found
                  </td>
                </tr>
              ) : (
                filteredHazards.map((hazard) => (
                  <tr
                    key={hazard.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <AlertTriangle
                          className="text-red-500 mr-2"
                          size={18}
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {hazard.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${severityColors[hazard.severity]}`}
                      >
                        {hazard.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {hazard.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {hazard.channel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(hazard.timestamp, 'MMM dd, yyyy HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${statusColors[hazard.status]}`}
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {hazard.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {hazard.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HazardLogs;
