"use client";

import { Button } from "@/components/ui/button";
import { ImageCropper } from "@/components/ui/image-cropper";
import { UI_CONFIG } from "@/lib/constants/constants";
import { cn } from "@/lib/utils/utils";
import { CropIcon, ImageIcon, CircleNotchIcon, UploadIcon, XIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BarcodeFormat } from "react-barcode-scanner";
import "react-barcode-scanner/polyfill";

interface ImageUploaderProps {
  onCapture: (isbn: string) => void;
  onError: (error: string) => void;
  className?: string;
}

/**
 * ImageUploader Component
 *
 * Handles image upload and barcode scanning from gallery images.
 * Supports drag-and-drop and file picker functionality.
 * Now includes cropping functionality when scanning fails.
 */
export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onCapture,
  onError,
  className,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for scanning results
  const [scanError, setScanError] = useState<string | null>(null);

  // Check if BarcodeDetector is available after polyfill loads
  useEffect(() => {
    console.log("Checking BarcodeDetector availability...");
    console.log("window.BarcodeDetector:", typeof window.BarcodeDetector);
    if (window.BarcodeDetector) {
      console.log("BarcodeDetector is available");
    } else {
      console.warn(
        "BarcodeDetector is not available - polyfill may not have loaded"
      );
    }
  }, []);

  // File validation
  const validateFile = (file: File): string | null => {
    const validTypes = UI_CONFIG.IMAGE.SUPPORTED_FORMATS;
    const maxSize = UI_CONFIG.IMAGE.MAX_FILE_SIZE;

    if (!validTypes.includes(file.type as (typeof validTypes)[number])) {
      return "Please select a valid image file (JPEG, PNG, or WebP)";
    }

    if (file.size > maxSize) {
      return "Image size must be less than 10MB";
    }

    return null;
  };

  // Process image for barcode detection using BarcodeDetector API
  const processImage = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      setScanError(null);
      setShowCropper(false);

      try {
        // Check if BarcodeDetector is available
        if (!window.BarcodeDetector) {
          console.warn("BarcodeDetector not available, using fallback");
          // For testing purposes, simulate a delay and then show an error
          await new Promise((resolve) => setTimeout(resolve, 2000));
          throw new Error(
            "Barcode detection is not supported in this browser. Please use a modern browser or try camera scanning instead."
          );
        }

        console.log("Starting image processing...");

        // Create object URL for the image
        const imageUrl = URL.createObjectURL(file);

        // Create image element to get dimensions
        const img = new Image();

        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            console.log(
              "Image loaded, dimensions:",
              img.width,
              "x",
              img.height
            );
            resolve();
          };
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = imageUrl;
        });

        // Create canvas to draw the image
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Failed to get canvas context");
        }

        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image to canvas
        ctx.drawImage(img, 0, 0);
        console.log("Image drawn to canvas");

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        console.log("Image data extracted, size:", imageData.data.length);

        // Create BarcodeDetector instance
        const barcodeDetector = new window.BarcodeDetector({
          formats: [
            BarcodeFormat.EAN_13,
            BarcodeFormat.UPC_A,
            BarcodeFormat.CODE_128,
          ],
        });

        console.log("BarcodeDetector created, starting detection...");

        // Detect barcodes
        const barcodes = await barcodeDetector.detect(imageData);
        console.log(
          "Detection completed, found barcodes:",
          barcodes?.length || 0
        );

        // Clean up
        URL.revokeObjectURL(imageUrl);

        if (barcodes && barcodes.length > 0) {
          // Success - barcode found
          const firstBarcode = barcodes[0];
          console.log("Barcode detected:", firstBarcode.rawValue);
          onCapture(firstBarcode.rawValue);
          setScanError(null);
        } else {
          // No barcode found in image
          const errorMsg =
            "No barcode detected in this image. You can try cropping the image to focus on the barcode area.";
          console.log("No barcode found in image");
          setScanError(errorMsg);
          onError(errorMsg);
        }

        setIsProcessing(false);
      } catch (error) {
        console.error("Image processing error:", error);
        const errorMsg =
          error instanceof Error
            ? error.message
            : "Failed to process image. Please try again.";
        setScanError(errorMsg);
        onError(errorMsg);
        setIsProcessing(false);
      }
    },
    [onCapture, onError]
  );

  // Handle cropped image
  const handleCroppedImage = useCallback(
    (croppedBlob: Blob) => {
      // Create a new file from the cropped blob
      const croppedFile = new File(
        [croppedBlob],
        selectedFile?.name || "cropped-image.jpg",
        {
          type: "image/jpeg",
        }
      );

      // Update the selected file and preview
      setSelectedFile(croppedFile);
      const newPreviewUrl = URL.createObjectURL(croppedBlob);
      setPreviewUrl(newPreviewUrl);

      // Hide cropper and process the cropped image
      setShowCropper(false);
      processImage(croppedFile);
    },
    [selectedFile, processImage]
  );

  // Handle crop cancel
  const handleCropCancel = useCallback(() => {
    setShowCropper(false);
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        onError(error);
        return;
      }

      setSelectedFile(file);

      // Create preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Process the image
      processImage(file);
    },
    [onError, processImage]
  );

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // Handle file input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // Clear selected file
  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setScanError(null);
    setIsProcessing(false);
    setShowCropper(false);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl]);

  // Open file picker
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Show cropper
  const handleShowCropper = () => {
    setShowCropper(true);
  };

  // If cropper is shown, render the cropper component
  if (showCropper && previewUrl) {
    return (
      <div className={cn("w-full h-full", className)}>
        <ImageCropper
          imageUrl={previewUrl}
          onCrop={handleCroppedImage}
          onCancel={handleCropCancel}
          className="w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      {!selectedFile ? (
        // Upload area
        <div
          className={cn(
            "relative w-full h-full border-2 border-dashed rounded-lg transition-colors duration-200 cursor-pointer",
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFilePicker}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <UploadIcon className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-3 sm:mb-4" />
            <h3 className="font-semibold text-base sm:text-lg mb-2">
              Upload Barcode Image
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 max-w-xs sm:max-w-sm">
              Drag and drop an image with a barcode, or click to select from
              your device
            </p>
            <Button variant="outline" size="sm">
              <ImageIcon className="h-4 w-4 mr-2" />
              Choose Image
            </Button>
            <p className="text-xs text-muted-foreground mt-2 sm:mt-3">
              JPEG, PNG, WebP (max 10MB)
            </p>
          </div>
        </div>
      ) : (
        // Preview and processing area
        <div className="relative w-full h-full bg-muted rounded-lg overflow-hidden">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Selected barcode image"
              className="w-full h-full object-contain"
            />
          )}

          {/* Processing overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
              <CircleNotchIcon className="h-8 w-8 animate-spin mb-3" weight="bold" />
              <p className="text-sm text-center px-4">
                Processing image for barcodes...
              </p>
            </div>
          )}

          {/* Clear button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={clearFile}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white border-0"
          >
            <XIcon className="h-4 w-4" />
          </Button>

          {/* Action buttons */}
          {!isProcessing && (
            <div className="absolute top-2 right-12 flex gap-2">
              {/* Crop button - show when there's a scan error */}
              {scanError && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShowCropper}
                  className="bg-black/50 hover:bg-black/70 text-white border-0"
                  title="Crop image to focus on barcode"
                >
                  <CropIcon className="h-4 w-4" />
                </Button>
              )}

              {/* Scan Again button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => processImage(selectedFile!)}
                className="bg-black/50 hover:bg-black/70 text-white border-0"
              >
                Scan Again
              </Button>
            </div>
          )}

          {/* File info */}
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {selectedFile.name}
          </div>

          {/* Error message */}
          {scanError && !isProcessing && (
            <div className="absolute bottom-12 left-2 right-2 bg-red-500/90 text-white text-xs px-3 py-2 rounded">
              {scanError}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
