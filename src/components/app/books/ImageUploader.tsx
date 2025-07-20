"use client";

import { BrowserMultiFormatReader } from "@zxing/library";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { handleScanningError } from "@/lib/utils/scanning-errors";

/**
 * ImageUploader Component
 *
 * Provides image upload functionality for barcode scanning from gallery images.
 * Uses @zxing/library's BrowserMultiFormatReader for direct image processing
 * without requiring camera access. Supports drag-and-drop and file picker.
 *
 * Features:
 * - Drag and drop image upload
 * - File picker with image validation
 * - Image preview with processing indicators
 * - File size and format validation
 * - Automatic cleanup of temporary URLs
 * - Accessible with proper ARIA labels
 */

interface ImageUploaderProps {
  /**
   * Callback fired when a barcode is successfully detected in an image
   * @param barcodeText - Raw text content of the detected barcode
   */
  onBarcodeDetected: (barcodeText: string) => void;

  /**
   * Callback fired when upload or processing errors occur
   * @param error - User-friendly error message
   */
  onError: (error: string) => void;

  /**
   * Whether image processing is currently in progress
   * Used to show loading states and disable interactions
   */
  isProcessing?: boolean;

  /**
   * Additional CSS classes for styling
   */
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onBarcodeDetected,
  onError,
  isProcessing = false,
  className = "",
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Debug logging function
  const debugLog = React.useCallback((message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log("ImageUploader:", logMessage, data || "");
    setDebugInfo((prev) => [...prev.slice(-4), logMessage]); // Keep last 5 logs
  }, []);

  // Maximum file size (10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  // Accepted image formats
  const ACCEPTED_FORMATS = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  /**
   * Process an uploaded image for barcode detection
   */
  const processImage = async (file: File) => {
    debugLog("Starting image processing", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    try {
      // Create image element for ZXing processing
      const imageUrl = URL.createObjectURL(file);
      const img = document.createElement("img");

      img.onload = async () => {
        debugLog("Image loaded successfully", {
          width: img.naturalWidth,
          height: img.naturalHeight,
          size: `${img.naturalWidth}x${img.naturalHeight}`,
        });

        try {
          debugLog("Creating BrowserMultiFormatReader");
          const reader = new BrowserMultiFormatReader();

          debugLog("Attempting to decode barcode from image");

          // Add timeout to prevent infinite hanging
          const decodePromise = reader.decodeFromImageElement(img);
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(
              () =>
                reject(
                  new Error(
                    "Decode timeout - no barcode found within 10 seconds"
                  )
                ),
              10000
            );
          });

          const result = (await Promise.race([
            decodePromise,
            timeoutPromise,
          ])) as any;

          debugLog("Barcode detected successfully!", result.getText());
          onBarcodeDetected(result.getText());
        } catch (error) {
          debugLog("Barcode decode failed", {
            error: error instanceof Error ? error.message : error,
            errorType:
              error instanceof Error ? error.constructor.name : typeof error,
            imageSize: `${img.naturalWidth}x${img.naturalHeight}`,
            aspectRatio: (img.naturalWidth / img.naturalHeight).toFixed(2),
          });
          // No barcode found or decode error
          onError(handleScanningError(error, "upload"));
        } finally {
          // Cleanup image URL
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
      onError(handleScanningError(error, "upload"));
    }
  };

  /**
   * Validate and handle file selection
   */
  const handleFileSelect = (file: File) => {
    debugLog("File selected", {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString(),
    });

    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      debugLog("File size validation failed", {
        size: file.size,
        maxSize: MAX_FILE_SIZE,
      });
      onError("File is too large. Please select an image under 10MB.");
      return;
    }

    // File type validation
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      debugLog("File type validation failed", {
        type: file.type,
        acceptedTypes: ACCEPTED_FORMATS,
      });
      onError(
        "Invalid file format. Please select a JPG, PNG, WebP, or GIF image."
      );
      return;
    }

    debugLog("File validation passed, creating preview");

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Process the image
    processImage(file);

    // Cleanup preview URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(previewUrl);
      debugLog("Preview URL cleaned up after 30s");
    }, 30000); // 30 seconds
  };

  /**
   * Handle file input change
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Handle drag and drop events
   */
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

  /**
   * Clear preview and reset
   */
  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Open file picker
   */
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className} relative`}>
      {/* Debug Info (dev only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-2 right-2 z-50 bg-black/80 text-white text-xs p-2 rounded">
          <div>Upload Status: {isProcessing ? "Processing" : "Ready"}</div>
          {debugInfo.slice(-2).map((log, i) => (
            <div key={i} className="truncate max-w-40">
              {log}
            </div>
          ))}
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
            💡 For best results: Use clear, well-lit images with the barcode
            fully visible
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

/**
 * Simplified image uploader for compact layouts
 * Basic upload without drag-and-drop or detailed preview
 */
export const CompactImageUploader: React.FC<
  Omit<ImageUploaderProps, "className">
> = ({ onBarcodeDetected, onError, isProcessing = false }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      onError("File too large. Please select an image under 10MB.");
      return;
    }

    try {
      const imageUrl = URL.createObjectURL(file);
      const img = document.createElement("img");

      img.onload = async () => {
        try {
          const reader = new BrowserMultiFormatReader();
          const result = await reader.decodeFromImageElement(img);
          onBarcodeDetected(result.getText());
        } catch {
          onError("No barcode detected in image. Please try a clearer image.");
        } finally {
          URL.revokeObjectURL(imageUrl);
        }
      };

      img.src = imageUrl;
    } catch {
      onError("Failed to process image. Please try again.");
    }
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
    </div>
  );
};
