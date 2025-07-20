"use client";

import * as React from "react";

/**
 * ScanningOverlay Component
 * 
 * Provides visual guidance for barcode scanning by displaying a scanning frame
 * with corner indicators and instructions. This overlay is positioned absolutely
 * over the camera preview to guide users in positioning barcodes correctly.
 * 
 * Features:
 * - Scanning frame with animated corner indicators
 * - Clear positioning instructions
 * - Accessible with proper ARIA labels
 * - Pointer-events-none to not interfere with camera
 * - Responsive design for mobile and desktop
 */

interface ScanningOverlayProps {
  /**
   * Whether scanning is currently active
   * Used to show/hide scanning indicator animations
   */
  isScanning?: boolean;
  
  /**
   * Custom instruction text to display
   * Defaults to standard barcode positioning instruction
   */
  instructionText?: string;
}

export const ScanningOverlay: React.FC<ScanningOverlayProps> = ({
  isScanning = false,
  instructionText = "Position barcode within the frame"
}) => {
  return (
    <div 
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      role="img"
      aria-label="Barcode scanning area with positioning guide"
    >
      <div className="relative flex flex-col items-center">
        {/* Main scanning frame */}
        <div className="relative w-64 h-32 sm:w-72 sm:h-36">
          {/* Frame border */}
          <div className="w-full h-full border-2 border-primary/60 rounded-lg relative">
            {/* Corner indicators */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-lg" />
            
            {/* Scanning animation line when active */}
            {isScanning && (
              <div className="absolute inset-0 overflow-hidden rounded-lg">
                <div 
                  className="w-full h-0.5 bg-primary animate-pulse"
                  style={{
                    animation: 'scan-line 2s linear infinite',
                  }}
                />
              </div>
            )}
          </div>
          
          {/* Scanning indicator dot */}
          {isScanning && (
            <div className="absolute -top-2 -right-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            </div>
          )}
        </div>
        
        {/* Instructions text */}
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground font-medium">
            {instructionText}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Make sure the barcode is clear and well-lit
          </p>
        </div>
      </div>
      
      {/* CSS for scanning animation */}
      <style jsx>{`
        @keyframes scan-line {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(800%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Simplified scanning overlay for minimal displays
 * Shows just the frame without instructions for compact layouts
 */
export const MinimalScanningOverlay: React.FC<{ isScanning?: boolean }> = ({
  isScanning = false
}) => {
  return (
    <div 
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      role="img"
      aria-label="Barcode scanning frame"
    >
      <div className="w-48 h-24 border-2 border-primary/60 rounded-lg relative">
        {/* Corner indicators only */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-primary" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-primary" />
        
        {/* Scanning indicator */}
        {isScanning && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};