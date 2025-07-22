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
// SafeCameraScanner is imported dynamically below
import { ImageUploader } from "./ImageUploader";
import { BookPreviewCard } from "../BookPreviewCard";
import dynamic from 'next/dynamic';

// Dynamically import SafeCameraScanner to prevent SSR issues
const SafeCameraScannerDynamic = dynamic(() => import("./SafeCameraScanner").then(mod => ({ default: mod.SafeCameraScanner })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center py-8">Loading camera...</div>
});

export type ScanMode = 'camera' | 'upload';
export type ScanStatus = 'idle' | 'processing' | 'success' | 'error';

interface BarcodeScannerProps {
  onBookFound: (book: GoogleBooksVolume, scanningMetadata?: {
    scanMethod: 'camera' | 'upload';
    isbn: string;
    scanStartTime: number;
  }) => void;
  onError: (error: string) => void;
  onManualEntry?: (isbn?: string) => void;
  isAdding?: boolean;
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
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  
  const debugLog = React.useCallback((message: string, data?: unknown) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log('BarcodeScanner:', logMessage, data || '');
    setDebugInfo(prev => [...prev.slice(-4), logMessage]);
  }, []);

  React.useEffect(() => {
    debugLog('BarcodeScanner initialized');
  }, [debugLog]);

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
      debugLog('Extracting ISBN from barcode text');
      const isbn = extractISBN(barcodeText);
      
      if (!isbn) {
        debugLog('ISBN extraction failed', { originalText: barcodeText });
        setLocalError('Invalid barcode format. Please scan a book ISBN barcode.');
        setStatus('error');
        return;
      }
      
      debugLog('ISBN extracted successfully', { isbn });
      setDetectedISBN(isbn);
      
      debugLog('Searching for book with detected barcode');
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

  const handleScanningError = (error: string) => {
    debugLog('Scanning error occurred', error);
    setLocalError(error);
    setStatus('error');
    setFoundBook(null);
  };

  const handleAddBook = (book: GoogleBooksVolume) => {
    if (book && detectedISBN) {
      onBookFound(book, {
        scanMethod: mode,
        isbn: detectedISBN,
        scanStartTime: scanStartTime
      });
    }
  };

  const resetScanning = () => {
    debugLog('Resetting scanning state');
    setStatus('idle');
    setLocalError(null);
    setFoundBook(null);
    setDetectedISBN(null);
    setScanStartTime(0);
  };

  const clearError = () => {
    setLocalError(null);
    setStatus('idle');
  };

  const handleManualEntry = () => {
    if (onManualEntry) {
      onManualEntry(detectedISBN || undefined);
    }
  };

  return (
    <div className={`space-y-6 ${className} relative`}>
      {/* Debug Info (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 z-50 bg-black/90 text-white text-xs p-3 rounded-lg max-w-80 max-h-40 overflow-y-auto">
          <div className="font-semibold mb-1">Scanner Debug Info</div>
          <div>Mode: <span className="text-blue-300">{mode}</span></div>
          <div>Status: <span className={
            status === 'success' ? 'text-green-300' : 
            status === 'error' ? 'text-red-300' : 
            status === 'processing' ? 'text-yellow-300' : 'text-gray-300'
          }>{status}</span></div>
          {detectedISBN && <div>ISBN: <span className="text-green-300">{detectedISBN}</span></div>}
          <div className="mt-2">
            <div className="text-gray-300">Recent logs:</div>
            {debugInfo.slice(-3).map((log, i) => (
              <div key={i} className="text-xs break-words">{log}</div>
            ))}
          </div>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'camera' ? 'default' : 'outline'}
          onClick={() => {
            setMode('camera');
            resetScanning();
          }}
          className="flex-1"
          disabled={status === 'processing'}
        >
          <Camera className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Camera</span>
          <span className="sm:hidden">Scan</span>
        </Button>
        <Button
          variant={mode === 'upload' ? 'default' : 'outline'}
          onClick={() => {
            setMode('upload');
            resetScanning();
          }}
          className="flex-1"
          disabled={status === 'processing'}
        >
          <Upload className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Upload Image</span>
          <span className="sm:hidden">Upload</span>
        </Button>
      </div>

      {/* Scanning Interface */}
      {mode === 'camera' ? (
        <SafeCameraScannerDynamic
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
            </ul>
          ) : (
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Take a clear, well-lit photo of the barcode</li>
              <li>• Ensure the barcode is in focus and readable</li>
              <li>• Crop the image to include just the barcode if possible</li>
              <li>• JPG, PNG, and WebP formats are supported</li>
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