/**
 * Scanning Error Utilities
 * 
 * Utility functions for mapping technical scanning errors to user-friendly messages
 * with actionable feedback and fallback options.
 */

/**
 * Maps camera-related errors to user-friendly messages
 * 
 * Converts technical MediaDevice errors into clear, actionable messages
 * that help users understand what went wrong and what they can do about it.
 * 
 * @param error - Camera/MediaDevice error object
 * @returns User-friendly error message with suggested actions
 * 
 * @example
 * mapCameraError(new Error('NotAllowedError')) 
 * // Returns: 'Camera permission denied. Please enable camera access in your browser settings.'
 */
export function mapCameraError(error: Error): string {
  const errorName = error.name || error.message;
  
  switch (errorName) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'Camera permission denied. Please enable camera access in your browser settings and refresh the page.';
      
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'No camera found on this device. Please use the image upload option instead.';
      
    case 'NotReadableError':
    case 'TrackStartError':
      return 'Camera is currently in use by another application. Please close other camera apps and try again.';
      
    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      return 'Camera does not support the required settings. Please try using image upload instead.';
      
    case 'NotSupportedError':
      return 'Camera is not supported in this browser. Please try using image upload or switch to a modern browser.';
      
    case 'AbortError':
      return 'Camera access was interrupted. Please try scanning again.';
      
    case 'SecurityError':
      return 'Camera access blocked due to security restrictions. Please check your browser settings.';
      
    default:
      return 'Camera error occurred. Please try using image upload instead or refresh the page.';
  }
}

/**
 * Handles scanning-related errors with context-specific messages
 * 
 * Provides appropriate error messages based on the scanning context
 * (camera, upload, or search) with helpful suggestions for resolution.
 * 
 * @param error - Error object or message
 * @param context - Context where the error occurred
 * @returns Contextual user-friendly error message
 * 
 * @example
 * handleScanningError(error, 'camera') 
 * // Returns camera-specific error message
 * 
 * handleScanningError(error, 'upload')
 * // Returns upload-specific error message
 */
export function handleScanningError(
  error: unknown, 
  context: 'camera' | 'upload' | 'search' | 'processing'
): string {
  // Handle different error types
  let errorMessage: string;
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'Unknown error occurred';
  }
  
  switch (context) {
    case 'camera':
      if (error instanceof Error) {
        return mapCameraError(error);
      }
      return 'Camera scanning failed. Please try image upload instead.';
      
    case 'upload':
      if (errorMessage.toLowerCase().includes('file')) {
        return 'Invalid file format. Please select a clear image file (JPG, PNG, or WebP).';
      }
      if (errorMessage.toLowerCase().includes('size')) {
        return 'File is too large. Please select an image under 10MB.';
      }
      if (errorMessage.toLowerCase().includes('barcode') || errorMessage.toLowerCase().includes('decode')) {
        return 'No barcode detected in the image. Please try a clearer image with better lighting and make sure the barcode is fully visible.';
      }
      return 'Image processing failed. Please try a different image or use camera scanning.';
      
    case 'search':
      if (errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('no results')) {
        return 'Book not found in our database. You can add it manually using the "Manual Entry" tab.';
      }
      if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
        return 'Network error. Please check your internet connection and try again.';
      }
      if (errorMessage.toLowerCase().includes('rate limit') || errorMessage.toLowerCase().includes('quota')) {
        return 'Search limit reached. Please try again in a few minutes.';
      }
      return 'Book search failed. Please try manual entry or scan again.';
      
    case 'processing':
      if (errorMessage.toLowerCase().includes('isbn') || errorMessage.toLowerCase().includes('invalid')) {
        return 'Invalid barcode format. Please scan a book ISBN barcode or use manual entry.';
      }
      return 'Barcode processing failed. Please try scanning again or use manual entry.';
      
    default:
      return 'Something went wrong. Please try again or use manual entry.';
  }
}

/**
 * Validates if an error is recoverable and suggests next steps
 * 
 * Determines whether an error is temporary/recoverable or requires
 * alternative approaches, and provides appropriate guidance.
 * 
 * @param error - Error object or message
 * @param context - Context where the error occurred
 * @returns Object with recovery information and suggested actions
 */
export function getErrorRecoveryInfo(
  error: unknown, 
  context: 'camera' | 'upload' | 'search' | 'processing'
): {
  isRecoverable: boolean;
  suggestedAction: string;
  alternativeMethod?: string;
} {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorName = error instanceof Error ? error.name : '';
  
  // Non-recoverable camera errors
  if (context === 'camera') {
    if (errorName === 'NotFoundError' || errorName === 'NotSupportedError') {
      return {
        isRecoverable: false,
        suggestedAction: 'Use image upload instead',
        alternativeMethod: 'upload'
      };
    }
    
    if (errorName === 'NotAllowedError') {
      return {
        isRecoverable: true,
        suggestedAction: 'Enable camera permissions in browser settings and refresh',
        alternativeMethod: 'upload'
      };
    }
    
    return {
      isRecoverable: true,
      suggestedAction: 'Try scanning again or refresh the page',
      alternativeMethod: 'upload'
    };
  }
  
  // Upload errors
  if (context === 'upload') {
    if (errorMessage.toLowerCase().includes('file') || errorMessage.toLowerCase().includes('format')) {
      return {
        isRecoverable: true,
        suggestedAction: 'Select a different image file (JPG, PNG, or WebP)',
        alternativeMethod: 'camera'
      };
    }
    
    if (errorMessage.toLowerCase().includes('barcode')) {
      return {
        isRecoverable: true,
        suggestedAction: 'Try a clearer image with better lighting',
        alternativeMethod: 'camera'
      };
    }
    
    return {
      isRecoverable: true,
      suggestedAction: 'Try a different image',
      alternativeMethod: 'camera'
    };
  }
  
  // Search errors
  if (context === 'search') {
    if (errorMessage.toLowerCase().includes('not found')) {
      return {
        isRecoverable: false,
        suggestedAction: 'Add the book manually',
        alternativeMethod: 'manual'
      };
    }
    
    if (errorMessage.toLowerCase().includes('network')) {
      return {
        isRecoverable: true,
        suggestedAction: 'Check internet connection and try again'
      };
    }
    
    return {
      isRecoverable: true,
      suggestedAction: 'Try scanning again',
      alternativeMethod: 'manual'
    };
  }
  
  // Default fallback
  return {
    isRecoverable: true,
    suggestedAction: 'Try again',
    alternativeMethod: 'manual'
  };
}

/**
 * Creates user-friendly error messages for barcode detection issues
 * 
 * Provides specific guidance based on common barcode scanning problems
 * with actionable tips for improving scan quality.
 * 
 * @param issue - Type of barcode detection issue
 * @returns Helpful error message with scanning tips
 */
export function getBarcodeDetectionTips(
  issue: 'poor_lighting' | 'blurry_image' | 'partial_barcode' | 'wrong_format' | 'multiple_barcodes'
): string {
  switch (issue) {
    case 'poor_lighting':
      return 'Poor lighting detected. Try scanning in better light or use your device\'s flashlight.';
      
    case 'blurry_image':
      return 'Image appears blurry. Hold your device steady and make sure the barcode is in focus.';
      
    case 'partial_barcode':
      return 'Barcode appears cut off. Make sure the entire barcode is visible in the camera view.';
      
    case 'wrong_format':
      return 'This doesn\'t appear to be a book ISBN barcode. Please scan the barcode on the back cover.';
      
    case 'multiple_barcodes':
      return 'Multiple barcodes detected. Try to focus on just the ISBN barcode and cover any other barcodes.';
      
    default:
      return 'Barcode scanning tips: Ensure good lighting, hold steady, and keep the entire barcode in view.';
  }
}