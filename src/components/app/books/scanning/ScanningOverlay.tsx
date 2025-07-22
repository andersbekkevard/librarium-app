"use client";

import { cn } from "@/lib/utils/utils";
import * as React from "react";

interface ScanningOverlayProps {
  isScanning?: boolean;
  isDetecting?: boolean;
  message?: string;
  className?: string;
}

/**
 * ScanningOverlay Component
 * 
 * Provides visual guidance and feedback during barcode scanning.
 * Shows scanning area with corner indicators and animated scanning line.
 * Displays status messages for user guidance.
 */
export const ScanningOverlay: React.FC<ScanningOverlayProps> = ({
  isScanning = false,
  isDetecting = false,
  message = "Position barcode within the frame",
  className,
}) => {
  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Scanning window */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="relative w-full max-w-sm aspect-[4/3] flex items-center justify-center">
          {/* Scanning frame */}
          <div className={cn(
            "relative w-64 h-48 border-2 rounded-lg transition-colors duration-300",
            isDetecting ? "border-green-500" : isScanning ? "border-white" : "border-white/60"
          )}>
            {/* Corner indicators */}
            <div className="absolute -top-1 -left-1 w-6 h-6">
              <div className="absolute top-0 left-0 w-6 h-1 bg-white rounded-full" />
              <div className="absolute top-0 left-0 w-1 h-6 bg-white rounded-full" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6">
              <div className="absolute top-0 right-0 w-6 h-1 bg-white rounded-full" />
              <div className="absolute top-0 right-0 w-1 h-6 bg-white rounded-full" />
            </div>
            <div className="absolute -bottom-1 -left-1 w-6 h-6">
              <div className="absolute bottom-0 left-0 w-6 h-1 bg-white rounded-full" />
              <div className="absolute bottom-0 left-0 w-1 h-6 bg-white rounded-full" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6">
              <div className="absolute bottom-0 right-0 w-6 h-1 bg-white rounded-full" />
              <div className="absolute bottom-0 right-0 w-1 h-6 bg-white rounded-full" />
            </div>
            
            {/* Animated scanning line */}
            {isScanning && !isDetecting && (
              <div className="absolute inset-x-0 h-0.5 bg-white rounded-full opacity-80 animate-pulse">
                <div 
                  className="h-full bg-gradient-to-r from-transparent via-white to-transparent rounded-full"
                  style={{
                    animation: 'scan-line 2s ease-in-out infinite'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Status message */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-sm text-center max-w-xs">
          {message}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scan-line {
          0% { 
            top: 0; 
            opacity: 0;
          }
          50% { 
            opacity: 1;
          }
          100% { 
            top: calc(100% - 2px); 
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ScanningOverlay;