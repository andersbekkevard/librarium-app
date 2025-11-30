"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { CameraIcon, CameraSlashIcon, FlashlightIcon, LightningSlashIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import {
  BarcodeFormat,
  BarcodeScanner,
  DetectedBarcode,
} from "react-barcode-scanner";
import "react-barcode-scanner/polyfill";
import { ScanningOverlay } from "./ScanningOverlay";

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
      // Feature detection for MediaDevices API
      if (!navigator.mediaDevices?.getUserMedia) {
        setHasPermission(false);
        onError("Camera not supported. Please use HTTPS or try a different browser.");
        return;
      }
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // Use back camera on mobile
        });
        setHasPermission(true);

        // Check torch support
        const tracks = stream.getVideoTracks();
        if (tracks.length > 0) {
          const capabilities = tracks[0].getCapabilities();
          const supportsTorch = "torch" in capabilities;
          setTorchSupported(supportsTorch);
        }

        // Clean up test stream
        stream.getTracks().forEach((track) => track.stop());
      } catch {
        setHasPermission(false);
        onError(
          "Camera access denied. Please allow camera permissions and refresh the page."
        );
      }
    };

    if (isActive) {
      checkPermissions();
    }
  }, [isActive, onError]);

  // Start scanning when component becomes active
  useEffect(() => {
    if (isActive && hasPermission) {
      setIsScanning(true);
    } else {
      setIsScanning(false);
    }
  }, [isActive, hasPermission]);

  const handleCapture = (barcodes: DetectedBarcode[]) => {
    if (!isActive || scanCooldown || !barcodes || barcodes.length === 0) {
      return;
    }

    const scannedCode = barcodes[0].rawValue;

    // Prevent duplicate scans
    if (scannedCode === lastScannedCode) {
      return;
    }

    setLastScannedCode(scannedCode);
    setScanCooldown(true);

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
    if (!navigator.mediaDevices?.getUserMedia) {
      onError("Camera not supported. Please use HTTPS or try a different browser.");
      return;
    }
    
    try {
      await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      setHasPermission(true);
    } catch {
      onError(
        "Camera access is required for barcode scanning. Please allow camera permissions in your browser settings."
      );
    }
  };

  // Permission denied state
  if (hasPermission === false) {
    return (
      <div
        className={cn(
          "relative w-full aspect-video bg-muted rounded-lg flex flex-col items-center justify-center p-6",
          className
        )}
      >
        <CameraSlashIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">Camera Access Required</h3>
        <p className="text-muted-foreground text-center mb-4 max-w-sm">
          To scan barcodes, please allow camera access in your browser settings.
        </p>
        <Button onClick={requestPermissions} variant="outline">
          <CameraIcon className="h-4 w-4 mr-2" />
          Enable Camera
        </Button>
      </div>
    );
  }

  // Loading state
  if (hasPermission === null) {
    return (
      <div
        className={cn(
          "relative w-full aspect-video bg-muted rounded-lg flex items-center justify-center",
          className
        )}
      >
        <div className="text-center">
          <CameraIcon className="h-8 w-8 animate-pulse text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Requesting camera access...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full aspect-video rounded-lg overflow-hidden",
        className
      )}
    >
      {isActive && hasPermission && (
        <BarcodeScanner
          onCapture={handleCapture}
          options={{
            formats: [
              BarcodeFormat.EAN_13,
              BarcodeFormat.UPC_A,
              BarcodeFormat.CODE_128,
            ],
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
              <LightningSlashIcon className="h-4 w-4" />
            ) : (
              <FlashlightIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* Inactive state overlay */}
      {!isActive && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
          <div className="text-center text-white">
            <CameraSlashIcon className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Camera paused</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraScanner;
