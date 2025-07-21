"use client";

import { Camera, Loader2, RotateCcw, Upload } from "lucide-react";
import * as React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-display";
import { googleBooksApi, GoogleBooksVolume } from "@/lib/api/google-books-api";
import { ErrorBuilder, ErrorCategory, ErrorSeverity } from "@/lib/errors/error-handling";
import { extractISBN } from "@/lib/utils/isbn-utils";
import { handleScanningError as handleError } from "@/lib/utils/scanning-errors";
import { canScanBarcodes, generateCompatibilityReport, isIOSSafari, isIOS, isIOSChrome, isMediaDevicesAvailable } from "@/lib/utils/browser-compatibility";
import { SafeCameraScanner } from "./SafeCameraScanner";
import { ImageUploader } from "./ImageUploader";
import { BookPreviewCard } from "../BookPreviewCard";

/**
 * BarcodeScanner Component
 * 
 * Main orchestrator component for barcode scanning functionality.
 * Provides mode switching between camera and image upload scanning,
 * handles ISBN extraction and validation, searches for books via
 * Google Books API, and manages the complete scanning workflow.
 * 
 * Features:
 * - Camera and image upload mode toggle
 * - ISBN extraction from various barcode formats
 * - Google Books API integration for metadata
 * - Error handling with user-friendly messages
 * - Book preview and addition workflow
 * - Responsive design for mobile and desktop
 */

export type ScanMode = 'camera' | 'upload';
export type ScanStatus = 'idle' | 'processing' | 'success' | 'error';

interface BarcodeScannerProps {
  /**
   * Callback fired when a book is found and ready to be added
   * @param book - Google Books volume object
   * @param scanningMetadata - Metadata about the scanning process
   */
  onBookFound: (book: GoogleBooksVolume, scanningMetadata?: {
    scanMethod: 'camera' | 'upload';
    isbn: string;
    scanStartTime: number;
  }) => void;
  
  /**
   * Callback fired when scanning errors occur
   * @param error - Error message to display
   */
  onError: (error: string) => void;
  
  /**
   * Callback fired when user wants to switch to manual entry
   * @param isbn - Optional pre-filled ISBN from barcode detection
   */
  onManualEntry?: (isbn?: string) => void;
  
  /**
   * Whether book addition is currently in progress
   * Used to show loading states in book preview
   */
  isAdding?: boolean;
  
  /**
   * Additional CSS classes for styling
   */
  className?: string;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onBookFound,
  onManualEntry,
  isAdding = false,
  className = ""
}) => {
  const [mode, setMode] = useState<ScanMode>('camera');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [foundBook, setFoundBook] = useState<GoogleBooksVolume | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [detectedISBN, setDetectedISBN] = useState<string | null>(null);
  const [scanStartTime, setScanStartTime] = useState<number>(0);
  // Debug info is logged to console but not displayed in production UI
  const [compatibility, setCompatibility] = useState<{
    camera: boolean;
    upload: boolean;
    reasons: string[];
  } | null>(null);
  
  // Debug logging function
  const debugLog = React.useCallback((message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log('BarcodeScanner:', logMessage, data || '');
  }, []);

  // Check browser compatibility on mount
  React.useEffect(() => {
    const checkCompatibility = async () => {
      debugLog('Checking browser compatibility');
      try {
        const compat = await canScanBarcodes();
        const report = await generateCompatibilityReport();
        
        debugLog('Compatibility check complete', {
          camera: compat.camera,
          upload: compat.upload,
          reasons: compat.reasons,
          browserInfo: report.browser,
          isIOSSafari: isIOSSafari(),
          isMediaDevicesAvailable: isMediaDevicesAvailable()
        });
        
        setCompatibility(compat);
        
        // Proactive fallback for iOS devices with MediaDevices issues
        if (isIOS() && !isMediaDevicesAvailable()) {
          const browserType = isIOSChrome() ? 'iOS Chrome' : 'iOS Safari';
          debugLog(`${browserType} detected with MediaDevices API unavailable - forcing upload mode`);
          setMode('upload');
          setLocalError(`Camera scanning is not supported on this iOS device (${browserType}). Please use image upload instead.`);
        }
        // Switch to upload mode if camera not supported
        else if (!compat.camera && compat.upload && mode === 'camera') {
          debugLog('Auto-switching to upload mode due to camera incompatibility');
          setMode('upload');
        }
        
        // Show warnings if needed
        if (compat.reasons.length > 0) {
          debugLog('Compatibility issues found', compat.reasons);
        }
        
      } catch (error) {
        debugLog('Compatibility check failed', error);
        // Fallback for iOS when even compatibility checking fails
        if (isIOS()) {
          const browserType = isIOSChrome() ? 'iOS Chrome' : 'iOS Safari';
          debugLog(`${browserType} compatibility check failed - defaulting to upload mode`);
          setMode('upload');
          setLocalError(`Camera access may not be available on ${browserType}. Please use image upload to scan barcodes.`);
        }
      }
    };
    
    checkCompatibility();
  }, [debugLog, mode]);

  /**
   * Handle barcode detection from camera or image upload
   */
  const handleBarcodeDetected = async (barcodeText: string) => {
    const startTime = Date.now();
    setScanStartTime(startTime);
    setStatus('processing');
    setLocalError(null);
    setFoundBook(null);
    
    debugLog('Barcode detected', { 
      text: barcodeText, 
      length: barcodeText.length,
      mode: mode,
      timestamp: startTime
    });
    
    try {
      // Extract ISBN from barcode text
      debugLog('Extracting ISBN from barcode text');
      const isbn = extractISBN(barcodeText);
      
      if (!isbn) {
        debugLog('ISBN extraction failed', { originalText: barcodeText });
        setLocalError('Invalid barcode format. Please scan a book ISBN barcode.');
        setStatus('error');
        return;
      }
      
      debugLog('ISBN extracted successfully', { isbn });
      
      // Store detected ISBN for potential manual entry fallback
      setDetectedISBN(isbn);
      
      // For scanning use cases, skip strict validation and let Google Books API decide
      // This allows for more permissive handling of real-world barcodes
      debugLog('Searching for book with detected barcode');
      
      // Search for book using Google Books API
      const books = await googleBooksApi.searchByISBN(isbn, 1);
      
      debugLog('Google Books API response', { 
        booksFound: books.data?.length || 0,
        searchDuration: Date.now() - startTime 
      });
      
      if (!books.success || !books.data || books.data.length === 0) {
        debugLog('No books found in database');
        setLocalError('Book not found in our database. You can add it manually using the "Manual Entry" tab.');
        setStatus('error');
        return;
      }
      
      // Book found successfully
      debugLog('Book found successfully', { 
        title: books.data[0].volumeInfo.title,
        authors: books.data[0].volumeInfo.authors
      });
      setFoundBook(books.data[0]);
      setStatus('success');
      
    } catch (error) {
      debugLog('Error during book search', { 
        error: error instanceof Error ? error.message : error,
        errorType: error instanceof Error ? error.constructor.name : typeof error
      });
      const errorMessage = handleError(error, 'search');
      setLocalError(errorMessage);
      setStatus('error');
    }
  };

  /**
   * Handle scanning errors from camera or upload components
   */
  const handleScanningError = (error: string) => {
    setLocalError(error);
    setStatus('error');
    setFoundBook(null);
  };

  /**
   * Add the found book to user's library
   */
  const handleAddBook = (book: GoogleBooksVolume) => {
    if (book && detectedISBN) {
      // Pass scanning metadata to parent for event logging
      onBookFound(book, {
        scanMethod: mode,
        isbn: detectedISBN,
        scanStartTime: scanStartTime
      });
      // Keep the preview visible but mark as added
    }
  };

  /**
   * Reset scanning state to try again
   */
  const resetScanning = () => {
    setStatus('idle');
    setLocalError(null);
    setFoundBook(null);
    setDetectedISBN(null);
    setScanStartTime(0);
  };

  /**
   * Clear error and continue scanning
   */
  const clearError = () => {
    setLocalError(null);
    setStatus('idle');
  };

  /**
   * Handle manual entry fallback
   */
  const handleManualEntry = () => {
    if (onManualEntry) {
      onManualEntry(detectedISBN || undefined);
    }
  };

  return (
    <div className={`space-y-6 ${className} relative`}>
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'camera' ? 'default' : 'outline'}
          onClick={() => {
            setMode('camera');
            resetScanning();
          }}
          className="flex-1"
          disabled={status === 'processing' || (compatibility?.camera === false)}
          title={compatibility?.camera === false ? 'Camera not available' : ''}
        >
          <Camera className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Camera</span>
          <span className="sm:hidden">Scan</span>
          {compatibility?.camera === false && (
            <span className="ml-1 text-xs opacity-60">⚠</span>
          )}
        </Button>
        <Button
          variant={mode === 'upload' ? 'default' : 'outline'}
          onClick={() => {
            setMode('upload');
            resetScanning();
          }}
          className="flex-1"
          disabled={status === 'processing' || (compatibility?.upload === false)}
          title={compatibility?.upload === false ? 'File upload not available' : ''}
        >
          <Upload className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Upload Image</span>
          <span className="sm:hidden">Upload</span>
          {compatibility?.upload === false && (
            <span className="ml-1 text-xs opacity-60">⚠</span>
          )}
        </Button>
      </div>

      {/* Compatibility Warnings */}
      {compatibility && compatibility.reasons && compatibility.reasons.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          <p className="font-medium mb-1">
            {isIOS() ? `iOS ${isIOSChrome() ? 'Chrome' : 'Safari'} Camera Limitations:` : 'Browser Compatibility Issues:'}
          </p>
          <ul className="text-xs space-y-1">
            {compatibility.reasons.map((reason, i) => (
              <li key={i}>• {reason}</li>
            ))}
          </ul>
          {isIOS() && (
            <div className="mt-2 pt-2 border-t border-amber-300 text-xs">
              <p className="font-medium">💡 For iOS devices:</p>
              <ul className="mt-1 space-y-1">
                <li>• Use the &quot;Upload Image&quot; option instead</li>
                <li>• Take a clear photo of the barcode first</li>
                <li>• Ensure good lighting and focus</li>
                {isIOSChrome() && (
                  <li>• Chrome on iOS has the same camera limitations as Safari</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Scanning Interface */}
      {mode === 'camera' ? (
        <SafeCameraScanner
          onBarcodeDetected={handleBarcodeDetected}
          onError={handleScanningError}
          paused={status === 'success'}
          onSwitchToUpload={() => setMode('upload')}
        />
      ) : (
        <ImageUploader
          onBarcodeDetected={handleBarcodeDetected}
          onError={handleScanningError}
          isProcessing={status === 'processing'}
        />
      )}

      {/* Processing State */}
      {status === 'processing' && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-medium">Searching for book...</p>
              <p className="text-sm text-muted-foreground">Please wait while we find the book information</p>
            </div>
          </div>
        </div>
      )}

      {/* Success State - Book Found */}
      {status === 'success' && foundBook && (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-green-600">Book Found!</h3>
            <p className="text-sm text-muted-foreground">
              Review the details below and add to your library
            </p>
          </div>
          
          <BookPreviewCard
            book={foundBook}
            onAddBook={handleAddBook}
            isAdding={isAdding}
          />
          
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={resetScanning}
              disabled={isAdding}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Scan Another Book
            </Button>
          </div>
        </div>
      )}

      {/* Error State */}
      {localError && (
        <div className="space-y-3">
          <ErrorAlert
            error={new ErrorBuilder(localError)
              .withCategory(ErrorCategory.VALIDATION)
              .withSeverity(ErrorSeverity.MEDIUM)
              .withType("scanning_error")
              .build()}
            onDismiss={clearError}
          />
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={resetScanning}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Try Again
            </Button>
            {(localError.includes('manual') || localError.includes('not found')) && onManualEntry && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualEntry}
              >
                Manual Entry
                {detectedISBN && ' (with ISBN)'}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Scanning Tips */}
      {status === 'idle' && !localError && (
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            💡 <strong>{mode === 'camera' ? 'Camera Scanning Tips:' : 'Image Upload Tips:'}</strong>
          </p>
          {mode === 'camera' ? (
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Ensure good lighting for best results</li>
              <li>• Hold the device steady when scanning</li>
              <li>• Make sure the entire barcode is visible</li>
              <li>• Try different angles if scanning fails</li>
              {isIOS() && (
                <li>• <strong>iOS users:</strong> Try &quot;Upload Image&quot; if camera doesn&apos;t work</li>
              )}
            </ul>
          ) : (
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Take a clear, well-lit photo of the barcode</li>
              <li>• Ensure the barcode is in focus and readable</li>
              <li>• Crop the image to include just the barcode if possible</li>
              <li>• JPG, PNG, and WebP formats are supported</li>
              {isIOS() && (
                <li>• <strong>Perfect for iOS devices!</strong> Works reliably on Safari and Chrome</li>
              )}
            </ul>
          )}
        </div>
      )}

      {/* Accessibility announcements */}
      <div aria-live="polite" className="sr-only">
        {status === 'processing' && 'Searching for book information...'}
        {status === 'success' && foundBook && `Book found: ${foundBook.volumeInfo.title}. Review details and add to library.`}
        {status === 'error' && localError && `Error: ${localError}`}
        {status === 'idle' && 'Ready to scan. Point camera at barcode or upload an image.'}
      </div>

    </div>
  );
};