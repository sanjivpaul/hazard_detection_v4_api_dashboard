import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  Calendar,
  Gauge,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { useLogs } from "../hooks/useLogs";
import { format } from "date-fns";
import {
  getHazardImageUrl,
  getHazardImageUrlDirect,
} from "../utils/imageUtils";

const severityColors = {
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

const HazardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hazards, loading } = useLogs();

  console.log("hazards===>", hazards);
  console.log("id===>", id);

  // Find the hazard by ID
  const hazard = hazards.find((h) => h.id === id);
  console.log("hazard details===>", hazard);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading hazard details...
          </p>
        </div>
      </div>
    );
  }

  if (!hazard) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate("/hazards")}
          className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline"
        >
          <ArrowLeft size={20} />
          Back to Hazard Logs
        </button>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-8 text-center">
          <AlertTriangle className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Hazard Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The hazard you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  // Parse timestamp
  let timestamp = new Date();
  try {
    const normalizedTimestamp = hazard.timestamp.replace(",", ".");
    timestamp = new Date(normalizedTimestamp);
    if (isNaN(timestamp.getTime())) {
      const timeMatch = hazard.timestamp.match(
        /(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/
      );
      if (timeMatch) {
        timestamp = new Date(`${timeMatch[1]}T${timeMatch[2]}`);
      }
    }
  } catch (e) {
    console.warn("Failed to parse timestamp:", hazard.timestamp);
  }

  // Capitalize severity
  const severity =
    hazard.severity.charAt(0).toUpperCase() +
    hazard.severity.slice(1).toLowerCase();

  // Get image URL
  const imageUrl = hazard.image_path
    ? getHazardImageUrlDirect(hazard.image_path)
    : null;

  // Debug logging
  if (hazard.image_path) {
    console.log("Original image path:", hazard.image_path);
    console.log("Processed image URL:", imageUrl);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/hazards")}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
        >
          <ArrowLeft size={20} />
          Back to Hazard Logs
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Hazard Details
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Detailed information about the detected hazard
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hazard Image */}
          {imageUrl ? (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <ImageIcon
                    size={20}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Hazard Image
                  </h2>
                </div>
              </div>
              <div className="p-4">
                <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden aspect-video">
                  <img
                    src={imageUrl}
                    alt={`${hazard.type} hazard`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      console.error("Failed to load image:", {
                        originalPath: hazard.image_path,
                        processedUrl: imageUrl,
                        error: e,
                      });
                      e.target.style.display = "none";
                      const errorDiv = e.target.nextElementSibling;
                      if (errorDiv) {
                        errorDiv.style.display = "flex";
                      }
                    }}
                    onLoad={() => {
                      console.log("Image loaded successfully:", imageUrl);
                    }}
                  />
                  <div
                    className="hidden absolute inset-0 items-center justify-center bg-gray-200 dark:bg-gray-700"
                    style={{ display: "none" }}
                  >
                    <div className="text-center p-4">
                      <ImageIcon
                        size={48}
                        className="mx-auto text-gray-400 mb-2"
                      />
                      <p className="text-gray-600 dark:text-gray-400">
                        Failed to load image
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {hazard.image_path}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-8 text-center">
              <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No image available for this hazard
              </p>
            </div>
          )}

          {/* Description */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText
                size={20}
                className="text-gray-600 dark:text-gray-400"
              />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Description
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {hazard.description || "No description available."}
            </p>
          </div>
        </div>

        {/* Sidebar - Hazard Information */}
        <div className="space-y-6">
          {/* Hazard Type Card */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-2 rounded-lg ${
                  hazard.severity === "high"
                    ? "bg-red-100 dark:bg-red-900/30"
                    : hazard.severity === "medium"
                    ? "bg-yellow-100 dark:bg-yellow-900/30"
                    : "bg-blue-100 dark:bg-blue-900/30"
                }`}
              >
                <AlertTriangle
                  className={
                    hazard.severity === "high"
                      ? "text-red-600 dark:text-red-400"
                      : hazard.severity === "medium"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-blue-600 dark:text-blue-400"
                  }
                  size={24}
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {hazard.type}
                </h2>
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                    severityColors[hazard.severity] || severityColors.low
                  }`}
                >
                  {severity}
                </span>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Details
            </h3>
            <div className="space-y-4">
              {/* Timestamp */}
              <div className="flex items-start gap-3">
                <Calendar
                  size={20}
                  className="text-gray-400 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Detected At
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {format(timestamp, "MMM dd, yyyy")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(timestamp, "h:mm:ss a")}
                  </p>
                </div>
              </div>

              {/* Confidence */}
              {hazard.confidence && (
                <div className="flex items-start gap-3">
                  <Gauge
                    size={20}
                    className="text-gray-400 flex-shrink-0 mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Confidence
                    </p>
                    <div className="mt-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {hazard.confidence}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            hazard.confidence >= 80
                              ? "bg-green-500"
                              : hazard.confidence >= 60
                              ? "bg-yellow-500"
                              : "bg-orange-500"
                          }`}
                          style={{ width: `${hazard.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Path (for debugging) */}
              {hazard.image_path && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Image Path
                  </p>
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
                    {hazard.image_path}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Raw Data (for debugging) */}
          {hazard.raw && (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Raw Data
              </h3>
              <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-auto max-h-64">
                {JSON.stringify(hazard.raw, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HazardDetails;
