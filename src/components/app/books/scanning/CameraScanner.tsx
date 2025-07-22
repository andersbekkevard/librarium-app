"use client";

import { useState, useEffect } from "react";
import {
  BarcodeScanner,
} from "react-barcode-scanner";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Flashlight, FlashlightOff } from "lucide-react";
import { ScanningOverlay } from "./ScanningOverlay";
import { cn } from "@/lib/utils/utils";

interface CameraScannerProps {
  onCapture: (isbn: string) => void;
  onError: (error: string) => void;
  isActive?: boolean;
  className?: string;
}

/**
 * CameraScanner Component
 * 
 * Handles live camera barcode scanning using react-barcode-scanner.
 * Optimized for book ISBN barcodes with proper error handling and user guidance.
 */
export const CameraScanner: React.FC<CameraScannerProps> = ({
  onCapture,
  onError,
  isActive = true,
  className,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string>("");
  const [scanCooldown, setScanCooldown] = useState(false);

  // Check camera permission and torch support on mount
  useEffect(() => {
    const checkPermissions = async () => {
      console.log('[CameraScanner] Checking camera permissions...');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log('[CameraScanner] Camera permission granted');
        setHasPermission(true);
        
        // Check torch support
        const tracks = stream.getVideoTracks();
        if (tracks.length > 0) {
          const capabilities = tracks[0].getCapabilities();
          const supportsTorch = 'torch' in capabilities;
          console.log('[CameraScanner] Torch supported:', supportsTorch);
          setTorchSupported(supportsTorch);
        }
        
        // Clean up test stream
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('[CameraScanner] Camera permission denied:', error);
        setHasPermission(false);
        onError("Camera access denied. Please allow camera permissions and refresh the page.");
      }
    };

    if (isActive) {
      checkPermissions();
    }
  }, [isActive, onError]);

  // Start scanning when component becomes active
  useEffect(() => {
    if (isActive && hasPermission) {
      console.log('[CameraScanner] Starting scanning...');
      setIsScanning(true);
    } else {
      console.log('[CameraScanner] Stopping scanning...', { isActive, hasPermission });
      setIsScanning(false);
    }
  }, [isActive, hasPermission]);

  const handleCapture = (result: any) => {
    // Log raw scanner result for debugging
    console.log('[CameraScanner] Raw capture result:', result);
    
    if (!isActive || scanCooldown || !result) {
      console.log('[CameraScanner] Scan ignored:', { isActive, scanCooldown, hasResult: !!result });
      return;
    }

    const scannedCode = result.text || result.codeResult?.code || result;
    console.log('[CameraScanner] Extracted code:', scannedCode);

    // Prevent duplicate scans
    if (scannedCode === lastScannedCode) {
      console.log('[CameraScanner] Duplicate scan ignored:', scannedCode);
      return;
    }

    setLastScannedCode(scannedCode);
    setScanCooldown(true);
    
    console.log('[CameraScanner] Processing scan:', scannedCode);

    // Brief cooldown to prevent multiple rapid scans
    setTimeout(() => {
      setScanCooldown(false);
    }, 1500);

    onCapture(scannedCode);
  };

  const toggleTorch = () => {
    if (torchSupported) {
      setTorchEnabled(!torchEnabled);
    }
  };

  const requestPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
    } catch (error) {
      onError("Camera access is required for barcode scanning. Please allow camera permissions in your browser settings.");
    }
  };

  // Permission denied state
  if (hasPermission === false) {
    return (
      <div className={cn("relative w-full aspect-video bg-muted rounded-lg flex flex-col items-center justify-center p-6", className)}>
        <CameraOff className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">Camera Access Required</h3>
        <p className="text-muted-foreground text-center mb-4 max-w-sm">
          To scan barcodes, please allow camera access in your browser settings.
        </p>
        <Button onClick={requestPermissions} variant="outline">
          <Camera className="h-4 w-4 mr-2" />
          Enable Camera
        </Button>
      </div>
    );
  }

  // Loading state
  if (hasPermission === null) {
    return (
      <div className={cn("relative w-full aspect-video bg-muted rounded-lg flex items-center justify-center", className)}>
        <div className="text-center">
          <Camera className="h-8 w-8 animate-pulse text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Requesting camera access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full aspect-video rounded-lg overflow-hidden", className)}>
      {isActive && hasPermission && (
        <BarcodeScanner
          onCapture={handleCapture}
          options={{
            delay: 500, // Scan every 500ms for optimal performance
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {/* Scanning overlay */}
      {isActive && isScanning && (
        <ScanningOverlay
          isScanning={true}
          isDetecting={scanCooldown}
          message={
            scanCooldown 
              ? "Barcode detected! Searching..." 
              : "Position barcode within the frame"
          }
        />
      )}

      {/* Torch control */}
      {torchSupported && isActive && hasPermission && (
        <div className="absolute top-4 right-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleTorch}
            className="bg-black/50 hover:bg-black/70 text-white border-0"
          >
            {torchEnabled ? (
              <FlashlightOff className="h-4 w-4" />
            ) : (
              <Flashlight className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* Inactive state overlay */}
      {!isActive && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
          <div className="text-center text-white">
            <CameraOff className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Camera paused</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraScanner;