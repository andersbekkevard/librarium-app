/**
 * Scanning Error Handling Utilities
 * 
 * Provides user-friendly error messages and recovery suggestions for barcode scanning issues.
 */

export interface ScanningError {
  message: string;
  suggestions: string[];
  canRetry: boolean;
}

/**
 * Maps camera-related errors to user-friendly messages with recovery suggestions
 */
export const mapCameraError = (error: any): ScanningError => {
  const errorMessage = error?.message?.toLowerCase() || error?.name?.toLowerCase() || String(error).toLowerCase();

  if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
    return {
      message: "Camera access denied. Please allow camera permissions to scan barcodes.",
      suggestions: [
        "Click the camera icon in your browser's address bar",
        "Select 'Allow' for camera permissions",
        "Refresh the page and try again"
      ],
      canRetry: true,
    };
  }

  if (errorMessage.includes('notfound') || errorMessage.includes('no camera')) {
    return {
      message: "No camera found on this device.",
      suggestions: [
        "Try using the image upload option instead",
        "Make sure your device has a working camera",
        "Check that no other apps are using the camera"
      ],
      canRetry: false,
    };
  }

  if (errorMessage.includes('constraint') || errorMessage.includes('overconstrained')) {
    return {
      message: "Camera configuration issue. Your camera doesn't support the required settings.",
      suggestions: [
        "Try using the image upload option",
        "Make sure your camera supports barcode scanning",
        "Try refreshing the page"
      ],
      canRetry: true,
    };
  }

  if (errorMessage.includes('security') || errorMessage.includes('https')) {
    return {
      message: "Camera access requires a secure connection.",
      suggestions: [
        "Make sure you're using HTTPS",
        "Try accessing the site through a secure connection",
        "Use the image upload option as an alternative"
      ],
      canRetry: false,
    };
  }

  if (errorMessage.includes('abort') || errorMessage.includes('stopped')) {
    return {
      message: "Camera access was interrupted.",
      suggestions: [
        "Try scanning again",
        "Make sure no other apps are using the camera",
        "Refresh the page if the problem persists"
      ],
      canRetry: true,
    };
  }

  // Generic error fallback
  return {
    message: "Unable to access camera for barcode scanning.",
    suggestions: [
      "Try using the image upload option instead",
      "Check your camera permissions",
      "Refresh the page and try again"
    ],
    canRetry: true,
  };
};

/**
 * Handles barcode detection specific errors with context-aware messaging
 */
export const handleBarcodeDetectionError = (context: 'camera' | 'upload'): ScanningError => {
  if (context === 'camera') {
    return {
      message: "No barcode detected in camera view.",
      suggestions: [
        "Make sure the barcode is clearly visible",
        "Move the camera closer to the barcode",
        "Ensure good lighting conditions",
        "Try holding the camera steady"
      ],
      canRetry: true,
    };
  } else {
    return {
      message: "No barcode found in the uploaded image.",
      suggestions: [
        "Make sure the image contains a clear barcode",
        "Try a higher resolution image",
        "Ensure the barcode isn't blurry or damaged",
        "Use the camera scanner for better results"
      ],
      canRetry: true,
    };
  }
};

/**
 * Provides tips for improving barcode scanning quality
 */
export const getBarcodeQualityTips = (issue: 'blurry' | 'lighting' | 'angle' | 'distance'): string[] => {
  switch (issue) {
    case 'blurry':
      return [
        "Hold the camera steady",
        "Wait for the camera to focus",
        "Move closer to the barcode",
        "Clean the camera lens"
      ];
    
    case 'lighting':
      return [
        "Ensure good lighting on the barcode",
        "Avoid shadows on the barcode",
        "Use the flashlight button if available",
        "Avoid reflective surfaces"
      ];
    
    case 'angle':
      return [
        "Hold the camera parallel to the barcode",
        "Center the barcode in the scanning area",
        "Avoid tilting the camera",
        "Keep the barcode flat if possible"
      ];
    
    case 'distance':
      return [
        "Move the camera closer to the barcode",
        "Fill most of the scanning area with the barcode",
        "Don't get too close - keep some margin",
        "Try different distances for best focus"
      ];
    
    default:
      return [
        "Ensure the barcode is clear and undamaged",
        "Use good lighting",
        "Hold the camera steady",
        "Keep the barcode centered"
      ];
  }
};

/**
 * Handles network and API errors during book lookup
 */
export const handleBookLookupError = (error: any): ScanningError => {
  const errorMessage = String(error).toLowerCase();

  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return {
      message: "Network error while searching for the book.",
      suggestions: [
        "Check your internet connection",
        "Try scanning again",
        "Add the book manually if the problem persists"
      ],
      canRetry: true,
    };
  }

  if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
    return {
      message: "Too many requests. Please wait a moment before trying again.",
      suggestions: [
        "Wait a few seconds and try again",
        "Add the book manually as an alternative"
      ],
      canRetry: true,
    };
  }

  if (errorMessage.includes('not found') || errorMessage.includes('404')) {
    return {
      message: "Book not found in the database.",
      suggestions: [
        "Try scanning a different barcode",
        "Add the book manually with its details",
        "Double-check the ISBN on the book"
      ],
      canRetry: false,
    };
  }

  // Generic API error
  return {
    message: "Unable to look up the book details.",
    suggestions: [
      "Try scanning again",
      "Check your internet connection",
      "Add the book manually if needed"
    ],
    canRetry: true,
  };
};