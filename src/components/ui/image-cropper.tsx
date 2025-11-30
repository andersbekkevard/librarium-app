"use client";

import { Button } from "@/components/ui/button";
import { UI_CONFIG } from "@/lib/constants/constants";
import { BRAND_COLORS } from "@/lib/design/colors";
import { cn } from "@/lib/utils/utils";
import { CheckIcon, ArrowCounterClockwiseIcon, XIcon } from "@phosphor-icons/react";
import { useCallback, useRef, useState } from "react";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropperProps {
  imageUrl: string;
  onCrop: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  className?: string;
}

/**
 * ImageCropper Component
 *
 * Provides interactive image cropping functionality with drag-to-select area.
 * Users can drag to create a crop rectangle and apply or cancel the crop.
 */
export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageUrl,
  onCrop,
  onCancel,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Handle image load to get dimensions
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      setImageDimensions({ width: naturalWidth, height: naturalHeight });
      setImageLoaded(true);
    }
  }, []);

  // Convert screen coordinates to image coordinates
  const screenToImageCoords = useCallback(
    (screenX: number, screenY: number) => {
      if (!containerRef.current || !imageRef.current) return { x: 0, y: 0 };

      const rect = containerRef.current.getBoundingClientRect();
      const imageRect = imageRef.current.getBoundingClientRect();

      const x =
        ((screenX - imageRect.left) / imageRect.width) * imageDimensions.width;
      const y =
        ((screenY - imageRect.top) / imageRect.height) * imageDimensions.height;

      return {
        x: Math.max(0, Math.min(x, imageDimensions.width)),
        y: Math.max(0, Math.min(y, imageDimensions.height)),
      };
    },
    [imageDimensions]
  );

  // Handle mouse down to start crop selection
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!imageLoaded) return;

      setIsDragging(true);
      const coords = screenToImageCoords(e.clientX, e.clientY);
      setDragStart(coords);
      setCropArea({ x: coords.x, y: coords.y, width: 0, height: 0 });
    },
    [imageLoaded, screenToImageCoords]
  );

  // Handle mouse move to update crop area
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !imageLoaded) return;

      const coords = screenToImageCoords(e.clientX, e.clientY);
      const startX = Math.min(dragStart.x, coords.x);
      const startY = Math.min(dragStart.y, coords.y);
      const width = Math.abs(coords.x - dragStart.x);
      const height = Math.abs(coords.y - dragStart.y);

      setCropArea({ x: startX, y: startY, width, height });
    },
    [isDragging, imageLoaded, dragStart, screenToImageCoords]
  );

  // Handle mouse up to finish crop selection
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Apply the crop and create a new image blob
  const handleApplyCrop = useCallback(async () => {
    if (!cropArea || !imageRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Set canvas size to crop dimensions
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    // Draw the cropped portion
    ctx.drawImage(
      imageRef.current,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      cropArea.width,
      cropArea.height
    );

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCrop(blob);
        }
      },
      UI_CONFIG.IMAGE.CROP_FORMAT,
      UI_CONFIG.IMAGE.CROP_QUALITY
    );
  }, [cropArea, onCrop]);

  // Reset crop area
  const handleResetCrop = useCallback(() => {
    setCropArea(null);
    setIsDragging(false);
  }, []);

  // Convert image coordinates to screen coordinates for display
  const imageToScreenCoords = useCallback(
    (crop: CropArea) => {
      if (!containerRef.current || !imageRef.current) return crop;

      const imageRect = imageRef.current.getBoundingClientRect();
      const scaleX = imageRect.width / imageDimensions.width;
      const scaleY = imageRect.height / imageDimensions.height;

      return {
        x: crop.x * scaleX,
        y: crop.y * scaleY,
        width: crop.width * scaleX,
        height: crop.height * scaleY,
      };
    },
    [imageDimensions]
  );

  // Prevent context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div
      className={cn(
        "relative w-full h-full bg-black/90 flex flex-col",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Crop Image</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Image container */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div
          ref={containerRef}
          className="relative inline-block cursor-crosshair select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onContextMenu={handleContextMenu}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Image to crop"
            className="max-w-full max-h-full object-contain"
            onLoad={handleImageLoad}
            draggable={false}
          />

          {/* Crop overlay */}
          {cropArea && (
            <div
              className="absolute border-2 border-white shadow-lg"
              style={{
                left: `${imageToScreenCoords(cropArea).x}px`,
                top: `${imageToScreenCoords(cropArea).y}px`,
                width: `${imageToScreenCoords(cropArea).width}px`,
                height: `${imageToScreenCoords(cropArea).height}px`,
              }}
            >
              {/* Corner handles */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full border border-gray-800" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border border-gray-800" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white rounded-full border border-gray-800" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full border border-gray-800" />
            </div>
          )}

          {/* Semi-transparent overlay */}
          {cropArea && (
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute bg-black/50"
                style={{
                  left: 0,
                  top: 0,
                  width: `${imageToScreenCoords(cropArea).x}px`,
                  height: "100%",
                }}
              />
              <div
                className="absolute bg-black/50"
                style={{
                  left: `${imageToScreenCoords(cropArea).x}px`,
                  top: 0,
                  width: `${imageToScreenCoords(cropArea).width}px`,
                  height: `${imageToScreenCoords(cropArea).y}px`,
                }}
              />
              <div
                className="absolute bg-black/50"
                style={{
                  left: `${
                    imageToScreenCoords(cropArea).x +
                    imageToScreenCoords(cropArea).width
                  }px`,
                  top: 0,
                  width: `calc(100% - ${
                    imageToScreenCoords(cropArea).x +
                    imageToScreenCoords(cropArea).width
                  }px)`,
                  height: "100%",
                }}
              />
              <div
                className="absolute bg-black/50"
                style={{
                  left: `${imageToScreenCoords(cropArea).x}px`,
                  top: `${
                    imageToScreenCoords(cropArea).y +
                    imageToScreenCoords(cropArea).height
                  }px`,
                  width: `${imageToScreenCoords(cropArea).width}px`,
                  height: `calc(100% - ${
                    imageToScreenCoords(cropArea).y +
                    imageToScreenCoords(cropArea).height
                  }px)`,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      {!cropArea && (
        <div className="px-4 pb-4">
          <p className="text-sm text-muted-foreground text-center">
            Drag to select the area you want to crop
          </p>
        </div>
      )}

      {/* Controls */}
      {cropArea && (
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetCrop}
              className="text-muted-foreground"
            >
              <ArrowCounterClockwiseIcon className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleApplyCrop}
              className={cn(
                BRAND_COLORS.primary.bg,
                BRAND_COLORS.primary.bgHover
              )}
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Apply Crop
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCropper;
