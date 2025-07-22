"use client";

import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
// Image upload functionality temporarily simplified

interface ImageUploaderProps {
  onBarcodeDetected?: (barcodeText: string) => void;
  onError: (error: string) => void;
  isProcessing?: boolean;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onError,
  isProcessing = false,
  className = "",
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [lastScannedISBN] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const debugLog = React.useCallback((message: string, data?: unknown) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log("ImageUploader:", logMessage, data || "");
    setDebugInfo((prev) => [...prev.slice(-4), logMessage]);
  }, []);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const ACCEPTED_FORMATS = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  const processImage = async (file: File) => {
    debugLog("Starting image processing", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    try {
      const imageUrl = URL.createObjectURL(file);
      const img = document.createElement("img");

      img.onload = async () => {
        debugLog("Image loaded successfully", {
          width: img.naturalWidth,
          height: img.naturalHeight,
        });

        try {
          // For now, we'll use a simplified approach since react-barcode-scanner 
          // is primarily designed for camera input. We could integrate with a 
          // barcode detection service or use canvas-based detection.
          // This is a placeholder that simulates processing
          
          debugLog("Processing image for barcode detection");
          
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // For now, show an error message suggesting camera scanning instead
          onError("Image barcode detection is not yet implemented. Please use camera scanning instead.");
          
        } catch (error) {
          debugLog("Barcode decode failed", error);
          onError("Could not detect barcode in image. Please try a clearer image or use camera scanning.");
        } finally {
          URL.revokeObjectURL(imageUrl);
          debugLog("Image URL cleaned up");
        }
      };

      img.onerror = (error) => {
        debugLog("Image load error", error);
        URL.revokeObjectURL(imageUrl);
        onError("Invalid image file. Please select a valid image.");
      };

      debugLog("Setting image src to blob URL");
      img.src = imageUrl;
    } catch (error) {
      debugLog("Process image error", error);
      onError("Failed to process image. Please try again.");
    }
  };

  const handleFileSelect = (file: File) => {
    debugLog("File selected", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (file.size > MAX_FILE_SIZE) {
      debugLog("File size validation failed");
      onError("File is too large. Please select an image under 10MB.");
      return;
    }

    if (!ACCEPTED_FORMATS.includes(file.type)) {
      debugLog("File type validation failed");
      onError("Invalid file format. Please select a JPG, PNG, WebP, or GIF image.");
      return;
    }

    debugLog("File validation passed, creating preview");
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    processImage(file);

    setTimeout(() => {
      URL.revokeObjectURL(previewUrl);
      debugLog("Preview URL cleaned up after 30s");
    }, 30000);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className} relative`}>
      {/* Debug Info (dev only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-2 right-2 z-50 bg-black/90 text-white text-xs p-3 rounded-lg max-w-80 max-h-40 overflow-y-auto">
          <div className="font-semibold mb-1">Upload Debug Info</div>
          <div>Mode: upload</div>
          <div>Status: <span className={isProcessing ? 'text-yellow-300' : 'text-green-300'}>{isProcessing ? "Processing" : "Ready"}</span></div>
          <div>ISBN: {lastScannedISBN || 'None'}</div>
          <div className="mt-2">
            <div className="text-gray-300">Recent logs:</div>
            {debugInfo.slice(-3).map((log, i) => (
              <div key={i} className="text-xs break-words">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FORMATS.join(",")}
        onChange={handleInputChange}
        className="hidden"
        disabled={isProcessing}
        aria-label="Select image file for barcode scanning"
      />

      {/* Upload area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }
          ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!isProcessing ? openFilePicker : undefined}
        role="button"
        tabIndex={isProcessing ? -1 : 0}
        aria-label="Upload image area. Click to select file or drag and drop image here."
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !isProcessing) {
            e.preventDefault();
            openFilePicker();
          }
        }}
      >
        <div className="flex flex-col items-center space-y-2">
          <Upload
            className={`h-8 w-8 ${
              isDragOver ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isDragOver
                ? "Drop image here"
                : "Click to upload or drag image here"}
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP, or GIF up to 10MB
            </p>
            <p className="text-xs text-amber-600 mt-2">
              📝 Note: Image barcode scanning is currently being updated. Please use camera scanning for best results.
            </p>
          </div>
        </div>
      </div>

      {/* Image preview */}
      {preview && (
        <div className="relative">
          <div className="relative w-full rounded-lg border overflow-hidden">
            <Image
              src={preview}
              alt="Selected barcode image"
              width={400}
              height={160}
              className="w-full h-32 sm:h-40 object-contain bg-muted"
            />

            {/* Processing overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-medium">
                    Processing image...
                  </span>
                </div>
              </div>
            )}

            {/* Clear button */}
            {!isProcessing && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                onClick={(e) => {
                  e.stopPropagation();
                  clearPreview();
                }}
                aria-label="Remove selected image"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-2 text-center">
            Image uploaded. Processing for barcode detection...
          </p>
        </div>
      )}

      {/* Upload tips */}
      {!preview && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            💡 For best results: Use the camera scanning feature for real-time barcode detection
          </p>
        </div>
      )}

      {/* Accessibility announcements */}
      <div aria-live="polite" className="sr-only">
        {isProcessing && "Processing image for barcode detection..."}
        {preview &&
          !isProcessing &&
          "Image uploaded successfully. Barcode detection complete."}
      </div>
    </div>
  );
};

export const CompactImageUploader: React.FC<
  Omit<ImageUploaderProps, "className">
> = ({ onError, isProcessing = false }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      onError("File too large. Please select an image under 10MB.");
      return;
    }

    // For now, show message that image scanning is not available
    onError("Image barcode detection is currently being updated. Please use camera scanning instead.");
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
        disabled={isProcessing}
      />

      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </>
        )}
      </Button>
      
      <p className="text-xs text-amber-600 text-center">
        📝 Image scanning temporarily unavailable. Use camera instead.
      </p>
    </div>
  );
};