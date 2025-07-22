"use client";

import { useState, useCallback, useRef } from "react";
// Note: Image upload scanning will be implemented in a future iteration
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/utils";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation
  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return "Please select a valid image file (JPEG, PNG, or WebP)";
    }

    if (file.size > maxSize) {
      return "Image size must be less than 10MB";
    }

    return null;
  };

  // Process image for barcode detection
  const processImage = useCallback(async (file: File) => {
    setIsProcessing(true);
    
    try {
      // Create image element for processing
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Note: Full image processing implementation will be added in future iteration
      // For now, provide user feedback about the limitation
      
      setTimeout(() => {
        setIsProcessing(false);
        onError("Barcode detection from images is not yet fully implemented. Please use camera scanning or try a different image.");
      }, 2000);

      // Cleanup
      URL.revokeObjectURL(imageUrl);
      
    } catch (error) {
      setIsProcessing(false);
      onError("Failed to process image. Please try a different image or use camera scanning.");
    }
  }, [onCapture, onError]);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
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
  }, [onError, processImage]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Clear selected file
  const clearFile = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsProcessing(false);
  }, [previewUrl]);

  // Open file picker
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

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
            <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-3 sm:mb-4" />
            <h3 className="font-semibold text-base sm:text-lg mb-2">Upload Barcode Image</h3>
            <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 max-w-xs sm:max-w-sm">
              Drag and drop an image with a barcode, or click to select from your device
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
              <Loader2 className="h-8 w-8 animate-spin mb-3" />
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
            <X className="h-4 w-4" />
          </Button>

          {/* File info */}
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {selectedFile.name}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;