import { useState, useEffect } from "react";
import { logsAPI } from "../services/api";

/**
 * Custom hook to fetch and parse logs, extracting only hazard-related entries
 */
export const useLogs = () => {
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await logsAPI.getAll();
        const logs = response.logs || [];

        // Parse logs and extract only hazard-related entries
        // Track last timestamp to use for standalone JSON entries
        let lastTimestamp = null;

        const allParsedHazards = logs
          .map((logEntry) => {
            if (!logEntry || typeof logEntry !== "string") return null;

            let timestamp = null;
            let level = null;
            let message = logEntry.trim();

            // Try to parse standard log format: "2026-01-12 20:59:46,212 | WARNING | {...}"
            const parts = logEntry.split(" | ");
            if (parts.length >= 3) {
              timestamp = parts[0].trim();
              level = parts[1].trim();
              message = parts.slice(2).join(" | ").trim();

              // Update last timestamp if we found one
              if (timestamp) {
                lastTimestamp = timestamp;
              }
            } else {
              // For standalone JSON entries, use the last seen timestamp
              timestamp = lastTimestamp;
            }

            // Check if message contains hazard data (either in standard format or standalone JSON)
            if (!message.includes("hazard_detected")) {
              return null;
            }

            // Only process WARNING or INFO level logs, or standalone JSON entries
            if (level && level !== "WARNING" && level !== "INFO") {
              return null;
            }

            try {
              // Handle escaped JSON strings (e.g., "{\"key\": \"value\"}")
              // First, try to unescape if needed
              let jsonString = message;

              // If the message starts with escaped quotes, unescape it
              if (jsonString.startsWith('"') && jsonString.endsWith('"')) {
                try {
                  // Try to parse as a JSON string first (unescape)
                  jsonString = JSON.parse(jsonString);
                } catch (e) {
                  // If that fails, it might be a regular string, continue
                }
              }

              // Extract JSON from the message - handle both single-line and multi-line JSON
              // Also handle escaped JSON
              const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
              if (!jsonMatch) {
                return null;
              }

              let hazardData;
              try {
                // Try parsing the matched JSON
                hazardData = JSON.parse(jsonMatch[0]);
              } catch (e) {
                // If parsing fails, try unescaping first
                try {
                  const unescaped = jsonMatch[0]
                    .replace(/\\"/g, '"')
                    .replace(/\\n/g, "\n");
                  hazardData = JSON.parse(unescaped);
                } catch (e2) {
                  console.warn(
                    "Failed to parse JSON from log entry:",
                    jsonMatch[0],
                    e2
                  );
                  return null;
                }
              }

              // Only include if hazard_detected is true
              if (hazardData && hazardData.hazard_detected === true) {
                // Generate timestamp if not present (use current time or extract from previous log entry)
                if (!timestamp) {
                  // Try to find timestamp from previous log entries (they might be on separate lines)
                  // For now, use current time
                  timestamp = new Date()
                    .toISOString()
                    .replace("T", " ")
                    .substring(0, 23);
                }

                // Handle image_path - check for null, undefined, empty string, or actual URL
                let imagePath = null;
                if (hazardData.image_path) {
                  // Only set if it's a non-empty string
                  const pathStr = String(hazardData.image_path).trim();
                  if (
                    pathStr &&
                    pathStr !== "null" &&
                    pathStr !== "undefined"
                  ) {
                    imagePath = pathStr;
                  }
                }

                const hazard = {
                  id: `${timestamp}-${hazardData.hazard_type || Math.random()}`,
                  timestamp,
                  type: hazardData.hazard_type || "Unknown Hazard",
                  severity: (hazardData.severity || "Unknown").toLowerCase(),
                  confidence: hazardData.confidence || 0,
                  description: hazardData.description || "",
                  image_path: imagePath,
                  raw: hazardData,
                };

                return hazard;
              }
            } catch (e) {
              // Skip invalid JSON entries silently (they're not hazards)
              console.warn("Error parsing log entry:", logEntry, e);
              return null;
            }

            return null;
          })
          .filter((hazard) => hazard !== null);

        // Group hazards by unique key (timestamp + type) and merge duplicates
        // Prefer entries with image_path over those without
        const hazardMap = new Map();

        allParsedHazards.forEach((hazard) => {
          // Create a unique key based on timestamp (rounded to nearest second) and type
          // This groups duplicates that are the same hazard
          const timestampKey = hazard.timestamp.substring(0, 19); // Remove milliseconds
          const key = `${timestampKey}-${hazard.type}`;

          const existing = hazardMap.get(key);

          if (!existing) {
            // First occurrence of this hazard
            hazardMap.set(key, hazard);
          } else {
            // Merge: prefer the one with image_path
            if (hazard.image_path && !existing.image_path) {
              // New one has image_path, existing doesn't - replace
              hazardMap.set(key, hazard);
            } else if (!hazard.image_path && existing.image_path) {
              // Existing has image_path, new one doesn't - keep existing
              // Do nothing
            } else if (hazard.image_path && existing.image_path) {
              // Both have image_path - prefer the newer one or the one with better data
              // For now, prefer the one with image_path (they're the same)
              hazardMap.set(key, hazard);
            } else {
              // Neither has image_path - keep the first one
              // Do nothing
            }
          }
        });

        // Convert map to array and filter to only show hazards with image_path
        const parsedHazards = Array.from(hazardMap.values())
          .filter((hazard) => hazard.image_path !== null) // Only show hazards with images
          .sort((a, b) => {
            // Sort by timestamp (newest first)
            return new Date(b.timestamp) - new Date(a.timestamp);
          });

        // Debug logging
        console.log("Parsed hazards:", {
          total: allParsedHazards.length,
          withImages: parsedHazards.length,
          hazards: parsedHazards.map((h) => ({
            type: h.type,
            timestamp: h.timestamp,
            hasImage: !!h.image_path,
          })),
        });

        setHazards(parsedHazards);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
        setError(err.message || "Failed to fetch logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();

    // Refresh logs every 30 seconds
    const interval = setInterval(fetchLogs, 30000);

    return () => clearInterval(interval);
  }, []);

  return { hazards, loading, error };
};
