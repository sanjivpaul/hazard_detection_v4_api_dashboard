import { useState } from 'react';
import CCTVFeed from './CCTVFeed';
import { Grid, List } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '../../utils/constants';

// CCTV channels configuration
const channels = [
  { 
    id: 1, 
    name: 'Channel 1', 
    cameraId: 'channel_1', // Camera ID for WebSocket endpoint
    streamUrl: `${API_BASE_URL}${API_ENDPOINTS.VIDEO}`,
    useWebSocket: true, // Enable WebSocket streaming
  },
  { 
    id: 2, 
    name: 'Channel 2', 
    cameraId: 'channel_2', // Camera ID for WebSocket endpoint
    streamUrl: `${API_BASE_URL}${API_ENDPOINTS.VIDEO}`,
    useWebSocket: true, // Enable WebSocket streaming
  },
];

const CCTVGrid = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            CCTV Feeds
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Live monitoring of all security channels
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${
              viewMode === 'grid'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${
              viewMode === 'list'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Grid/List View */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-4'
        }
      >
        {channels.map((channel) => (
          <div
            key={channel.id}
            className={viewMode === 'grid' ? 'aspect-video' : 'h-64'}
          >
            <CCTVFeed
              channelName={channel.name}
              streamUrl={channel.streamUrl}
              streamType="auto"
              useWebSocket={channel.useWebSocket || false}
              cameraId={channel.cameraId}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CCTVGrid;
