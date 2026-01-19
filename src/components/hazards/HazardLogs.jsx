import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Search, Download } from "lucide-react";
import { format, parse } from "date-fns";
import { useLogs } from "../../hooks/useLogs";

const severityColors = {
  High: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  Medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

const statusColors = {
  Active: "bg-red-500",
  Resolved: "bg-green-500",
};

const HazardLogs = () => {
  const { hazards, loading, error } = useLogs();
  console.log("hazards===>", hazards);

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Transform log hazards to match table structure
  const formattedHazards = useMemo(() => {
    return hazards.map((hazard) => {
      // Parse timestamp - format: "2026-01-12 20:59:46,212"
      let timestamp = new Date();
      try {
        const normalizedTimestamp = hazard.timestamp.replace(",", ".");
        timestamp = new Date(normalizedTimestamp);
        if (isNaN(timestamp.getTime())) {
          // Fallback parsing
          const timeMatch = hazard.timestamp.match(
            /(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/
          );
          if (timeMatch) {
            timestamp = parse(
              `${timeMatch[1]} ${timeMatch[2]}`,
              "yyyy-MM-dd HH:mm:ss",
              new Date()
            );
          }
        }
      } catch (e) {
        console.warn("Failed to parse timestamp:", hazard.timestamp);
      }

      // Capitalize severity
      const severity =
        hazard.severity.charAt(0).toUpperCase() +
        hazard.severity.slice(1).toLowerCase();

      return {
        id: hazard.id,
        type: hazard.type,
        severity,
        location: "CCTV Feed", // Default location since logs don't have location
        channel: "Channel 1", // Default channel since logs don't have channel info
        timestamp,
        status: "Active", // All detected hazards are active by default
        description: hazard.description,
        confidence: hazard.confidence,
        image_path: hazard.image_path,
      };
    });
  }, [hazards]);

  const filteredHazards = useMemo(() => {
    return formattedHazards.filter((hazard) => {
      const matchesSearch =
        hazard.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hazard.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hazard.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity =
        severityFilter === "All" || hazard.severity === severityFilter;
      const matchesStatus =
        statusFilter === "All" || hazard.status === statusFilter;
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [formattedHazards, searchTerm, severityFilter, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Hazard Logs
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {loading
              ? "Loading hazards..."
              : `${hazards.length} hazard${
                  hazards.length !== 1 ? "s" : ""
                } detected`}
            {filteredHazards.length !== hazards.length &&
              ` (${filteredHazards.length} shown)`}
          </p>
        </div>
        <button
          onClick={() => {
            // Export functionality - can be implemented later
            const dataStr = JSON.stringify(filteredHazards, null, 2);
            const dataBlob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `hazard-logs-${
              new Date().toISOString().split("T")[0]
            }.json`;
            link.click();
            URL.revokeObjectURL(url);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          disabled={loading || filteredHazards.length === 0}
        >
          <Download size={18} />
          Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
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
            <option value="All">All Severities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            Loading hazards...
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center text-red-500 dark:text-red-400">
            Error loading hazards: {error}
          </div>
        ) : (
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
                    <td
                      colSpan="7"
                      className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      {searchTerm ||
                      severityFilter !== "All" ||
                      statusFilter !== "All"
                        ? "No hazards match your filters"
                        : "No hazards detected yet"}
                    </td>
                  </tr>
                ) : (
                  filteredHazards.map((hazard) => (
                    <tr
                      key={hazard.id}
                      onClick={() => navigate(`/hazards/${hazard.id}`)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <AlertTriangle
                            className={`mr-2 ${
                              hazard.severity === "High"
                                ? "text-red-500"
                                : hazard.severity === "Medium"
                                ? "text-yellow-500"
                                : "text-orange-500"
                            }`}
                            size={18}
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {hazard.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            severityColors[hazard.severity] ||
                            severityColors.Low
                          }`}
                        >
                          {hazard.severity}
                        </span>
                        {hazard.confidence && (
                          <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                            ({hazard.confidence}%)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {hazard.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {hazard.channel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {format(hazard.timestamp, "MMM dd, yyyy HH:mm:ss")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full mr-2 ${
                              statusColors[hazard.status] || statusColors.Active
                            }`}
                          />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {hazard.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                        <div className="truncate" title={hazard.description}>
                          {hazard.description}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HazardLogs;
