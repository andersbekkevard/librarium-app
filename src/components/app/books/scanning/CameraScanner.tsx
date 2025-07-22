"use client";

import { Flashlight, FlashlightOff } from "lucide-react";
import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScanningOverlay } from "./ScanningOverlay";

// Dynamic import for BarcodeScanner to prevent SSR issues
let BarcodeScanner: any = null;
if (typeof window !== 'undefined') {
  import('react-barcode-scanner').then(module => {
    BarcodeScanner = module.BarcodeScanner;
  });
}

// Type definition for native browser BarcodeDetector API
interface DetectedBarcode {
  rawValue: string;
  boundingBox: DOMRectReadOnly;
  cornerPoints: Array<{ x: number; y: number }>;
  format: string;
}

interface CameraScannerProps {
  onBarcodeDetected: (barcodeText: string) => void;
  onError: (error: string) => void;
  paused?: boolean;
  className?: string;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onBarcodeDetected,
  onError,
  paused = false,
  className = ""
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  const debugLog = React.useCallback((message: string, data?: unknown) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log('CameraScanner:', logMessage, data || '');
    setDebugInfo(prev => [...prev.slice(-4), logMessage]);
  }, []);

  useEffect(() => {
    setIsClient(true);
    debugLog('CameraScanner initialized', { paused });
  }, [debugLog, paused]);

  const handleCapture = React.useCallback((barcode: DetectedBarcode) => {
    if (barcode) {
      debugLog('Barcode detected!', barcode.rawValue);
      setIsScanning(false);
      onBarcodeDetected(barcode.rawValue);
    }
  }, [onBarcodeDetected, debugLog]);

  const handleError = React.useCallback((_event: React.SyntheticEvent<HTMLVideoElement>) => {
    debugLog('Camera error occurred');
    setIsScanning(false);
    onError('Camera access failed. Please check permissions and try again.');
  }, [onError, debugLog]);

  React.useEffect(() => {
    if (!paused) {
      setIsScanning(true);
    } else {
      setIsScanning(false);
    }
  }, [paused]);

  const toggleTorch = async () => {
    try {
      if (navigator.mediaDevices && 'torch' in navigator.mediaDevices) {
        setTorchEnabled(!torchEnabled);
        debugLog('Torch toggled', { enabled: !torchEnabled });
      }
    } catch (error) {
      debugLog('Torch toggle failed', error);
    }
  };

  React.useEffect(() => {
    const checkTorchSupport = async () => {
      try {
        if (navigator.mediaDevices && 'getSupportedConstraints' in navigator.mediaDevices) {
          const constraints = navigator.mediaDevices.getSupportedConstraints();
          if ('torch' in constraints) {
            setTorchSupported(true);
          }
        }
      } catch (error) {
        debugLog('Torch support check failed', error);
      }
    };
    
    checkTorchSupport();
  }, [debugLog]);

  return (
    <div className={`relative ${className}`}>
      {/* Debug Info (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 z-50 bg-black/90 text-white text-xs p-3 rounded-lg max-w-80 max-h-40 overflow-y-auto">
          <div className="font-semibold mb-1">Camera Debug Info</div>
          <div>Status: <span className={isScanning ? 'text-green-300' : 'text-yellow-300'}>{isScanning ? 'Scanning' : 'Ready'}</span></div>
          <div>Torch: {torchSupported ? (torchEnabled ? 'ON' : 'OFF') : 'N/A'}</div>
          <div className="mt-2">
            <div className="text-gray-300">Recent logs:</div>
            {debugInfo.slice(-3).map((log, i) => (
              <div key={i} className="text-xs break-words">{log}</div>
            ))}
          </div>
        </div>
      )}
      
      {/* Barcode Scanner */}
      <div className="w-full h-64 sm:h-72 rounded-lg bg-muted border overflow-hidden">
        {isClient && BarcodeScanner ? (
          <BarcodeScanner
            onCapture={handleCapture}
            onError={handleError}
            options={{
              formats: [
                "ean_13",    // Primary ISBN-13 format
                "upc_a",     // Older books/US publications
                "code_128",  // Internal book codes
              ],
              delay: 500,
            }}
            style={{
              width: "100%",
              height: "100%",
            }}
            autoPlay
            playsInline
            muted
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <p className="text-muted-foreground">Loading barcode scanner...</p>
          </div>
        )}
      </div>
      
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
      {torchSupported && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          onClick={toggleTorch}
          aria-label={torchEnabled ? "Turn off flashlight" : "Turn on flashlight"}
        >
          {torchEnabled ? (
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
            {paused ? 'Paused' : isScanning ? 'Scanning...' : 'Ready to scan'}
          </p>
        </div>
      </div>

      {/* Accessibility announcements */}
      <div aria-live="polite" className="sr-only">
        {paused && "Scanning paused. Book found."}
        {!paused && isScanning && "Scanning for barcode..."}
        {!paused && !isScanning && "Camera ready. Point at a barcode to scan."}
      </div>
    </div>
  );
};

export const CompactCameraScanner: React.FC<Omit<CameraScannerProps, 'className'>> = ({
  onBarcodeDetected,
  onError,
  paused = false
}) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  const handleCapture = React.useCallback((barcode: DetectedBarcode) => {
    if (barcode) {
      onBarcodeDetected(barcode.rawValue);
    }
  }, [onBarcodeDetected]);

  const handleError = React.useCallback((_event: React.SyntheticEvent<HTMLVideoElement>) => {
    onError('Camera access failed. Please check permissions and try again.');
  }, [onError]);

  return (
    <div className="relative">
      <div className="w-full h-48 rounded-lg bg-muted overflow-hidden">
        {isClient && BarcodeScanner ? (
          <BarcodeScanner
            onCapture={handleCapture}
            onError={handleError}
            options={{
              formats: [
                "ean_13",
                "upc_a", 
                "code_128",
              ],
              delay: 500,
            }}
            style={{
              width: "100%",
              height: "100%",
            }}
            autoPlay
            playsInline
            muted
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <p className="text-muted-foreground">Loading scanner...</p>
          </div>
        )}
      </div>
      <ScanningOverlay isScanning={!paused} />
    </div>
  );
};