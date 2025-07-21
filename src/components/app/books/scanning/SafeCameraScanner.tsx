"use client";

import * as React from "react";
import { AlertTriangle, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isIOS, isIOSChrome, isMediaDevicesAvailable } from "@/lib/utils/browser-compatibility";
import { CameraScanner } from "./CameraScanner";

interface SafeCameraScannerProps {
  onBarcodeDetected: (barcodeText: string) => void;
  onError: (error: string) => void;
  paused?: boolean;
  className?: string;
  onSwitchToUpload?: () => void;
}

/**
 * SafeCameraScanner Component
 * 
 * A wrapper around CameraScanner that provides graceful error handling
 * for iOS Safari and other browsers where the MediaDevices API may fail.
 * Automatically detects compatibility issues and provides fallback options.
 */
export const SafeCameraScanner: React.FC<SafeCameraScannerProps> = ({
  onBarcodeDetected,
  onError,
  paused = false,
  className = "",
  onSwitchToUpload
}) => {
  const [hasCameraError, setHasCameraError] = React.useState(false);
  const [isCheckingCamera, setIsCheckingCamera] = React.useState(true);

  React.useEffect(() => {
    const checkCameraAvailability = async () => {
      try {
        // Check if we're on iOS where MediaDevices might not be available
        if (isIOS() && !isMediaDevicesAvailable()) {
          const browserType = isIOSChrome() ? 'iOS Chrome' : 'iOS Safari';
          console.log(`SafeCameraScanner: ${browserType} detected without MediaDevices API`);
          setHasCameraError(true);
          setIsCheckingCamera(false);
          return;
        }

        // Try to check if cameras are available
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          await navigator.mediaDevices.enumerateDevices();
        }

        setIsCheckingCamera(false);
      } catch (error) {
        console.log('SafeCameraScanner: Camera check failed', error);
        setHasCameraError(true);
        setIsCheckingCamera(false);
      }
    };

    checkCameraAvailability();
  }, []);

  const handleCameraError = React.useCallback((error: string) => {
    console.log('SafeCameraScanner: Camera error occurred', error);
    setHasCameraError(true);
    onError(error);
  }, [onError]);

  if (isCheckingCamera) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="text-center space-y-2">
          <Camera className="h-8 w-8 mx-auto text-muted-foreground animate-pulse" />
          <p className="text-sm text-muted-foreground">Checking camera availability...</p>
        </div>
      </div>
    );
  }

  if (hasCameraError) {
    return (
      <div className={`text-center space-y-4 p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg ${className}`}>
        <div className="space-y-2">
          <AlertTriangle className="h-12 w-12 mx-auto text-amber-500" />
          <h3 className="font-medium text-foreground">Camera Not Available</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {isIOS() 
              ? `Camera scanning is not supported on this iOS device (${isIOSChrome() ? 'Chrome' : 'Safari'}). Please use image upload instead.`
              : "Unable to access camera. Please check permissions or try image upload instead."
            }
          </p>
        </div>
        
        {onSwitchToUpload && (
          <Button
            onClick={onSwitchToUpload}
            variant="outline"
            className="w-full max-w-xs"
          >
            Switch to Image Upload
          </Button>
        )}
        
        {isIOS() && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>💡 <strong>Tip for iOS users:</strong></p>
            <p>Take a clear photo of the barcode and upload it using the &quot;Upload Image&quot; option.</p>
            {isIOSChrome() && (
              <p><strong>Note:</strong> Chrome on iOS has the same camera limitations as Safari.</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <CameraScanner
      onBarcodeDetected={onBarcodeDetected}
      onError={handleCameraError}
      paused={paused}
      className={className}
    />
  );
};

export default SafeCameraScanner;