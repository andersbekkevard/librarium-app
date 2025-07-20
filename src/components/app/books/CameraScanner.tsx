"use client";

import { Flashlight, FlashlightOff } from "lucide-react";
import * as React from "react";
import { useZxing } from "react-zxing";

import { Button } from "@/components/ui/button";
import { mapCameraError } from "@/lib/utils/scanning-errors";
import { ScanningOverlay } from "./ScanningOverlay";

/**
 * CameraScanner Component
 * 
 * Provides camera-based barcode scanning using the react-zxing library.
 * Features a clean interface with scanning overlay, torch control, and
 * proper error handling for various camera-related issues.
 * 
 * This component leverages react-zxing's built-in camera management,
 * permission handling, and barcode detection capabilities while providing
 * a user-friendly interface consistent with the app's design system.
 */

interface CameraScannerProps {
  /**
   * Callback fired when a barcode is successfully detected
   * @param barcodeText - Raw text content of the detected barcode
   */
  onBarcodeDetected: (barcodeText: string) => void;
  
  /**
   * Callback fired when camera or scanning errors occur
   * @param error - User-friendly error message
   */
  onError: (error: string) => void;
  
  /**
   * Whether scanning should be paused
   * Useful for pausing detection after successful scan
   */
  paused?: boolean;
  
  /**
   * Additional CSS classes for styling
   */
  className?: string;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onBarcodeDetected,
  onError,
  paused = false,
  className = ""
}) => {
  const [isScanning, setIsScanning] = React.useState(false);
  const [cameraStatus, setCameraStatus] = React.useState<'initializing' | 'ready' | 'error' | 'no-camera'>('initializing');
  const [debugInfo, setDebugInfo] = React.useState<string[]>([]);
  
  // Debug logging function
  const debugLog = React.useCallback((message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log('CameraScanner:', logMessage, data || '');
    setDebugInfo(prev => [...prev.slice(-4), logMessage]); // Keep last 5 logs
  }, []);

  React.useEffect(() => {
    debugLog('CameraScanner initialized', { paused });
  }, [debugLog, paused]);
  
  // useZxing hook provides camera management and barcode detection
  const { ref, torch } = useZxing({
    paused,
    onResult: (result) => {
      debugLog('Barcode detected!', result.getText());
      setIsScanning(false);
      setCameraStatus('ready');
      onBarcodeDetected(result.getText());
    },
    onError: (error) => {
      debugLog('Camera error occurred', { name: error.name, message: error.message, stack: error.stack });
      setIsScanning(false);
      setCameraStatus('error');
      const userFriendlyError = mapCameraError(error);
      onError(userFriendlyError);
    },
    constraints: {
      video: {
        // Prefer back camera for better barcode scanning
        facingMode: 'environment',
        // Optimal resolution for barcode detection
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    },
    // Reduce detection frequency to improve performance
    timeBetweenDecodingAttempts: 300
  });

  // Monitor video element for camera stream status
  React.useEffect(() => {
    if (ref.current) {
      const video = ref.current;
      
      const handleLoadStart = () => {
        debugLog('Video load start');
        setCameraStatus('initializing');
      };
      
      const handleLoadedData = () => {
        debugLog('Video loaded data - camera ready');
        setCameraStatus('ready');
        setIsScanning(!paused);
      };
      
      const handleLoadedMetadata = () => {
        debugLog('Video metadata loaded', {
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          readyState: video.readyState
        });
      };
      
      const handleError = (e: Event) => {
        debugLog('Video element error', e);
        setCameraStatus('error');
      };

      video.addEventListener('loadstart', handleLoadStart);
      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('error', handleError);
      
      return () => {
        video.removeEventListener('loadstart', handleLoadStart);
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('error', handleError);
      };
    }
  }, [ref, debugLog, paused]);

  // Check for MediaDevices API support
  React.useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      debugLog('MediaDevices API not supported');
      setCameraStatus('no-camera');
      onError('Camera not supported in this browser. Please use image upload instead.');
    } else {
      debugLog('MediaDevices API supported');
    }
  }, [debugLog, onError]);

  return (
    <div className={`relative ${className}`}>
      {/* Camera Status Indicator (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 z-50 bg-black/80 text-white text-xs p-2 rounded">
          <div>Status: {cameraStatus}</div>
          <div>Torch: {torch.isAvailable ? (torch.isOn ? 'ON' : 'OFF') : 'N/A'}</div>
          {debugInfo.slice(-2).map((log, i) => (
            <div key={i} className="truncate max-w-40">{log}</div>
          ))}
        </div>
      )}
      
      {/* Video element for camera preview */}
      <video
        ref={ref}
        className="w-full h-64 sm:h-72 object-cover rounded-lg bg-muted border"
        playsInline
        muted
        autoPlay
        aria-label="Camera preview for barcode scanning"
      />
      
      {/* Scanning overlay with visual guidance */}
      <ScanningOverlay 
        isScanning={isScanning && !paused}
        instructionText={
          paused 
            ? "Barcode detected! Review the book details below."
            : "Position the barcode within the frame"
        }
      />
      
      {/* Torch/flashlight control */}
      {torch.isAvailable && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          onClick={torch.isOn ? torch.off : torch.on}
          aria-label={torch.isOn ? "Turn off flashlight" : "Turn on flashlight"}
        >
          {torch.isOn ? (
            <FlashlightOff className="h-4 w-4" />
          ) : (
            <Flashlight className="h-4 w-4" />
          )}
        </Button>
      )}
      
      {/* Loading/Status indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-background/80 backdrop-blur-sm rounded-full px-3 py-1">
          <p className="text-xs text-muted-foreground">
            {cameraStatus === 'initializing' && 'Initializing camera...'}
            {cameraStatus === 'ready' && !paused && (isScanning ? 'Scanning...' : 'Ready to scan')}
            {cameraStatus === 'ready' && paused && 'Paused'}
            {cameraStatus === 'error' && 'Camera error'}
            {cameraStatus === 'no-camera' && 'No camera available'}
          </p>
        </div>
      </div>

      {/* Camera Permission Request */}
      {cameraStatus === 'error' && (
        <div className="absolute inset-0 bg-background/90 flex items-center justify-center">
          <div className="text-center space-y-3 p-4">
            <p className="text-sm font-medium">Camera Access Required</p>
            <p className="text-xs text-muted-foreground">Please allow camera access to scan barcodes</p>
            <Button
              size="sm"
              onClick={() => {
                debugLog('Attempting to request camera permission');
                window.location.reload();
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}
      
      {/* Accessibility announcements */}
      <div aria-live="polite" className="sr-only">
        {paused && "Scanning paused. Book found."}
        {!paused && isScanning && "Scanning for barcode..."}
        {!paused && !isScanning && "Camera ready. Point at a barcode to scan."}
      </div>
    </div>
  );
};

/**
 * Simplified camera scanner for compact layouts
 * Provides basic scanning without torch control or detailed overlay
 */
export const CompactCameraScanner: React.FC<Omit<CameraScannerProps, 'className'>> = ({
  onBarcodeDetected,
  onError,
  paused = false
}) => {
  const { ref } = useZxing({
    paused,
    onResult: (result) => {
      onBarcodeDetected(result.getText());
    },
    onError: (error) => {
      const userFriendlyError = mapCameraError(error);
      onError(userFriendlyError);
    },
    constraints: {
      video: {
        facingMode: 'environment',
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    }
  });

  return (
    <div className="relative">
      <video
        ref={ref}
        className="w-full h-48 object-cover rounded-lg bg-muted"
        playsInline
        muted
        autoPlay
        aria-label="Compact camera view for barcode scanning"
      />
      <ScanningOverlay isScanning={!paused} />
    </div>
  );
};