import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Maximize2, Volume2, VolumeX } from 'lucide-react';
import { WS_BASE_URL, WS_ENDPOINTS } from '../../utils/constants';

const CCTVFeed = ({ channelName, streamUrl, streamType = 'auto', refreshInterval = 500, useWebSocket = false, wsUrl, cameraId }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(null);
  const [useMJPEG, setUseMJPEG] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const isIntentionallyClosingRef = useRef(false);
  const isMountedRef = useRef(true);
  const useWebSocketRef = useRef(useWebSocket);
  const cameraIdRef = useRef(cameraId);
  const wsUrlRef = useRef(wsUrl);
  const isPlayingRef = useRef(isPlaying);
  
  // Debug: Log props on mount
  useEffect(() => {
    console.log('CCTVFeed mounted/updated:', {
      channelName,
      cameraId,
      useWebSocket,
      wsUrl,
      isPlaying
    });
  }, [channelName, cameraId, useWebSocket, wsUrl, isPlaying]);
  
  // Keep refs in sync with props and state
  useEffect(() => {
    useWebSocketRef.current = useWebSocket;
    cameraIdRef.current = cameraId;
    wsUrlRef.current = wsUrl;
    isPlayingRef.current = isPlaying;
    console.log('Refs updated:', {
      useWebSocket: useWebSocketRef.current,
      cameraId: cameraIdRef.current,
      wsUrl: wsUrlRef.current,
      isPlaying: isPlayingRef.current
    });
  }, [useWebSocket, cameraId, wsUrl, isPlaying]);
  
  // Auto-detect MJPEG or force based on streamType
  const shouldUseMJPEG = streamType === 'mjpeg' || 
                         streamType === 'auto' && (useMJPEG || streamUrl.includes('mjpeg') || streamUrl.includes('multipart') || streamUrl.includes('image/jpeg'));

  // WebSocket connection management - defined as a stable function
  const connectWebSocket = useRef(() => {
    // Don't connect if already connected or if conditions aren't met
    // Check current state values directly since this is called from useEffect
    if (!useWebSocketRef.current) {
      return;
    }
    
    // If already connected, don't create a new connection
    if (wsRef.current) {
      const readyState = wsRef.current.readyState;
      if (readyState === WebSocket.OPEN || readyState === WebSocket.CONNECTING) {
        console.log('WebSocket already connected/connecting, skipping...', readyState);
        return;
      }
    }
    
    // Close existing connection if it exists (in any state)
    if (wsRef.current) {
      isIntentionallyClosingRef.current = true;
      try {
        wsRef.current.close();
      } catch (e) {
        // Ignore errors when closing
      }
      wsRef.current = null;
    }

    // Build WebSocket URL with camera_id parameter
    let wsEndpoint;
    if (wsUrlRef.current) {
      wsEndpoint = wsUrlRef.current;
    } else if (cameraIdRef.current) {
      // Use the new format: /ws/video/{camera_id}
      wsEndpoint = `${WS_BASE_URL}${WS_ENDPOINTS.VIDEO}/${cameraIdRef.current}`;
    } else {
      // Don't connect without camera_id - it will result in 403
      console.error('Cannot connect WebSocket: cameraId is missing!', {
        cameraId: cameraIdRef.current,
        cameraIdProp: cameraId,
        useWebSocket: useWebSocketRef.current
      });
      setError('Camera ID is required for WebSocket connection');
      return;
    }
    
    console.log('Connecting to WebSocket:', wsEndpoint, {
      cameraId: cameraIdRef.current,
      baseUrl: WS_BASE_URL,
      endpoint: WS_ENDPOINTS.VIDEO
    });
    
    try {
      const ws = new WebSocket(wsEndpoint);
      wsRef.current = ws;
      isIntentionallyClosingRef.current = false;

      ws.onopen = () => {
        if (!isMountedRef.current) {
          ws.close();
          return;
        }
        console.log('WebSocket connected successfully:', wsEndpoint);
        setWsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        // Initialize image element if it exists
        if (imgRef.current && !imgRef.current.src) {
          // Set a placeholder to ensure element is ready
          imgRef.current.style.display = 'block';
        }
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        
        if (event.data instanceof Blob) {
          // Handle binary data (JPEG frames)
          const blob = event.data;
          const url = URL.createObjectURL(blob);
          
          if (imgRef.current) {
            // Clean up previous blob URL
            if (imgRef.current.src && imgRef.current.src.startsWith('blob:')) {
              URL.revokeObjectURL(imgRef.current.src);
            }
            imgRef.current.src = url;
            setError(null);
          }
        } else if (typeof event.data === 'string') {
          // Handle text data (base64 encoded images)
          try {
            const data = JSON.parse(event.data);
            
            if (imgRef.current) {
              // Check for both 'image' and 'frame' fields (support different backend formats)
              const imageData = data.image || data.frame;
              
              if (imageData) {
                // Base64 encoded frame - ensure proper data URL format
                const base64Data = imageData.startsWith('data:') 
                  ? imageData 
                  : `data:image/jpeg;base64,${imageData}`;
                imgRef.current.src = base64Data;
                setError(null);
              } else {
                console.warn('WebSocket message missing image/frame data:', data);
              }
            }
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e, event.data);
            setError('Failed to parse WebSocket frame data');
          }
        }
      };

      ws.onerror = (error) => {
        if (!isMountedRef.current) return;
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
        setWsConnected(false);
      };

      ws.onclose = (event) => {
        if (!isMountedRef.current) return;
        
        console.log('WebSocket disconnected', { 
          code: event.code, 
          reason: event.reason,
          wasClean: event.wasClean,
          intentionallyClosed: isIntentionallyClosingRef.current 
        });
        
        setWsConnected(false);
        wsRef.current = null;
        
        // Only auto-reconnect if:
        // 1. Component is still mounted
        // 2. We're still playing
        // 3. WebSocket is enabled
        // 4. We didn't intentionally close it
        if (
          isMountedRef.current &&
          isPlayingRef.current &&
          useWebSocketRef.current &&
          !isIntentionallyClosingRef.current
        ) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          reconnectAttemptsRef.current++;
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current && isPlayingRef.current && useWebSocketRef.current) {
              connectWebSocket.current();
            }
          }, delay);
        } else {
          reconnectAttemptsRef.current = 0;
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError('Failed to connect WebSocket');
      setWsConnected(false);
    }
  }).current;

  // WebSocket lifecycle - only depends on useWebSocket, isPlaying, and cameraId
  useEffect(() => {
    isMountedRef.current = true;
    
    // Update refs immediately before checking
    useWebSocketRef.current = useWebSocket;
    cameraIdRef.current = cameraId;
    wsUrlRef.current = wsUrl;
    isPlayingRef.current = isPlaying;
    
    if (useWebSocket && isPlaying) {
      // Ensure cameraId is set before connecting
      if (!cameraId && !wsUrl) {
        console.error('WebSocket connection requires cameraId or wsUrl', {
          cameraId,
          wsUrl,
          channelName,
          cameraIdRef: cameraIdRef.current
        });
        setError('Camera ID is required for WebSocket connection');
        return;
      }
      
      // Small delay to ensure refs are set and avoid rapid reconnections
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current && useWebSocketRef.current && isPlayingRef.current) {
          // Double-check cameraId is available
          if (!cameraIdRef.current && !wsUrlRef.current) {
            console.error('CameraId still not available after delay');
            return;
          }
          
          console.log('Attempting WebSocket connection with:', {
            cameraId: cameraIdRef.current,
            wsUrl: wsUrlRef.current,
            useWebSocket: useWebSocketRef.current,
            channelName
          });
          connectWebSocket();
        }
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        // Cleanup: intentionally close when dependencies change
        isIntentionallyClosingRef.current = true;
        if (wsRef.current) {
          try {
            wsRef.current.close();
          } catch (e) {
            // Ignore errors
          }
          wsRef.current = null;
        }
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };
    } else {
      // Intentionally close if not playing or WebSocket disabled
      isIntentionallyClosingRef.current = true;
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {
          // Ignore errors
        }
        wsRef.current = null;
        setWsConnected(false);
      }
      // Clear any pending reconnection
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    }
  }, [useWebSocket, isPlaying, cameraId, wsUrl, channelName]); // Include cameraId and wsUrl in dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      isIntentionallyClosingRef.current = true;
      
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {
          // Ignore errors
        }
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, []);

  // Ensure image element is ready for WebSocket frames
  useEffect(() => {
    if (useWebSocket && imgRef.current) {
      imgRef.current.style.display = 'block';
      console.log('Image element ready for WebSocket frames');
    }
  }, [useWebSocket]);

  useEffect(() => {
    if (videoRef.current && streamUrl) {
      // Load the video source
      videoRef.current.load();
      
      if (isPlaying) {
        videoRef.current.play().catch((err) => {
          console.error('Error playing video:', err);
          setError('Failed to play video stream');
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, streamUrl]);

  // Handle video errors - auto-fallback to MJPEG
  const handleVideoError = (e) => {
    const video = e.target;
    
    // If video format is not supported, try MJPEG instead
    if (video.error && video.error.code === video.error.MEDIA_ERR_SRC_NOT_SUPPORTED) {
      console.log('Video format not supported, switching to MJPEG mode...');
      setUseMJPEG(true);
      setError(null);
      return;
    }
    
    let errorMessage = 'Failed to load video stream';
    
    if (video.error) {
      switch (video.error.code) {
        case video.error.MEDIA_ERR_ABORTED:
          errorMessage = 'Video loading aborted';
          break;
        case video.error.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error - check CORS settings on backend';
          break;
        case video.error.MEDIA_ERR_DECODE:
          errorMessage = 'Video decoding error - unsupported format';
          break;
        default:
          errorMessage = `Video error: ${video.error.message || 'Unknown error'}`;
      }
    }
    
    console.error('Video error details:', {
      code: video.error?.code,
      message: video.error?.message,
      networkState: video.networkState,
      readyState: video.readyState,
      src: streamUrl
    });
    
    setError(errorMessage);
    setIsPlaying(false);
  };

  // Handle video load
  const handleVideoLoad = () => {
    setError(null);
    if (isPlaying && videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Use proxy in development to avoid CORS issues
  const getStreamUrl = () => {
    if (import.meta.env.DEV && streamUrl.includes('localhost:8000')) {
      // Use Vite proxy in development - proxy will forward /api to localhost:8000
      const url = new URL(streamUrl);
      return url.pathname + url.search;
    }
    return streamUrl;
  };

  const finalStreamUrl = getStreamUrl();
  
  // For MJPEG streams, add timestamp to prevent caching
  const getMJPEGUrl = useCallback(() => {
    const baseUrl = finalStreamUrl;
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}_t=${Date.now()}`;
  }, [finalStreamUrl]);
  
  // Auto-refresh MJPEG stream - optimized to reduce server load
  useEffect(() => {
    if (shouldUseMJPEG && imgRef.current && isPlaying) {
      let isRefreshing = false;
      let timeoutId = null;
      
      const refreshImage = () => {
        if (imgRef.current && isPlaying && !isRefreshing) {
          const img = imgRef.current;
          // Only refresh if image has loaded to avoid stacking requests
          if (img.complete && img.naturalHeight !== 0) {
            isRefreshing = true;
            // Force reload by changing src with timestamp
            const newSrc = getMJPEGUrl();
            const cleanup = () => {
              isRefreshing = false;
            };
            img.onload = cleanup;
            img.onerror = cleanup;
            img.src = newSrc;
          }
        }
        
        // Schedule next refresh
        if (isPlaying) {
          timeoutId = setTimeout(refreshImage, refreshInterval);
        }
      };
      
      // Start the refresh cycle
      timeoutId = setTimeout(refreshImage, refreshInterval);
      
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [shouldUseMJPEG, isPlaying, getMJPEGUrl, refreshInterval]);
  
  // Debug: log the URL being used
  useEffect(() => {
    console.log('CCTV Feed URL:', {
      original: streamUrl,
      final: finalStreamUrl,
      isDev: import.meta.env.DEV,
      useMJPEG: shouldUseMJPEG
    });
  }, [streamUrl, finalStreamUrl, shouldUseMJPEG]);

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden shadow-lg group"
      style={{ minHeight: '200px', height: '100%' }}
    >
      {/* WebSocket Stream */}
      {useWebSocket ? (
        <>
          <img
            ref={imgRef}
            alt={channelName}
            className="w-full h-full object-cover"
            style={{ 
              display: isPlaying ? 'block' : 'none',
              minHeight: '200px',
              backgroundColor: '#000'
            }}
            onError={(e) => {
              console.error('WebSocket stream image error:', e);
              console.error('Image src:', e.target.src?.substring(0, 100));
              setError('Failed to display WebSocket stream');
            }}
            onLoad={() => {
              console.log('WebSocket frame loaded successfully');
              setError(null);
            }}
          />
          {!wsConnected && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-white text-center">
                <p className="text-sm">Connecting to WebSocket...</p>
              </div>
            </div>
          )}
        </>
      ) : shouldUseMJPEG ? (
        /* MJPEG Stream (using img tag) */
        <img
          ref={imgRef}
          src={getMJPEGUrl()}
          alt={channelName}
          className="w-full h-full object-cover"
          style={{ display: isPlaying ? 'block' : 'none' }}
          onError={(e) => {
            console.error('MJPEG stream error:', e);
            setError('Failed to load MJPEG stream');
          }}
          onLoad={() => {
            setError(null);
            // For true MJPEG streams (multipart/x-mixed-replace), browser handles refresh
            // Only manually refresh if needed
          }}
        />
      ) : (
        /* Video element */
        <video
          ref={videoRef}
          src={finalStreamUrl}
          className="w-full h-full object-cover"
          muted={isMuted}
          autoPlay
          playsInline
          controls={false}
          preload="auto"
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
          onCanPlay={() => {
            setError(null);
            if (isPlaying && videoRef.current) {
              videoRef.current.play().catch(console.error);
            }
          }}
          onStalled={() => console.warn('Video stalled, attempting to reload...')}
          onWaiting={() => console.warn('Video buffering...')}
        />
      )}

      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-center text-white p-4">
            <p className="text-sm font-medium mb-2">{error}</p>
            <button
              onClick={() => {
                setError(null);
                if (useWebSocket) {
                  // Reconnect WebSocket
                  if (wsRef.current) {
                    wsRef.current.close();
                  }
                  connectWebSocket();
                  setIsPlaying(true);
                } else if (shouldUseMJPEG && imgRef.current) {
                  imgRef.current.src = getMJPEGUrl();
                  setIsPlaying(true);
                } else if (videoRef.current) {
                  videoRef.current.load();
                  setIsPlaying(true);
                }
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Channel label */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm font-medium">
        {channelName}
      </div>

      {/* Controls overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 bg-black bg-opacity-70 text-white rounded-full hover:bg-opacity-90 transition"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 bg-black bg-opacity-70 text-white rounded-full hover:bg-opacity-90 transition"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-3 bg-black bg-opacity-70 text-white rounded-full hover:bg-opacity-90 transition"
          >
            <Maximize2 size={20} />
          </button>
        </div>
      </div>

      {/* Status indicator */}
      <div className="absolute bottom-2 right-2 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${wsConnected || !useWebSocket ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></div>
        <span className="text-xs text-white bg-black bg-opacity-70 px-2 py-1 rounded">
          {useWebSocket ? (wsConnected ? 'LIVE (WS)' : 'CONNECTING...') : 'LIVE'}
        </span>
      </div>
    </div>
  );
};

export default CCTVFeed;
