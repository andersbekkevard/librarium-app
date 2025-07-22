"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Loader2, AlertCircle, CheckCircle2, Bug } from "lucide-react";
import { CameraScanner } from "./CameraScanner";
import { ImageUploader } from "./ImageUploader";
import { BookPreviewCard } from "../BookPreviewCard";
import { DebugOverlay } from "./DebugOverlay";
import { extractISBN } from "@/lib/utils/isbn-utils";
import { GoogleBooksVolume } from "@/lib/api/google-books-api";
import { useBookSearch } from "@/lib/hooks/useBookSearch";
import { cn } from "@/lib/utils/utils";

interface BarcodeScannerProps {
  onAddBook: (book: GoogleBooksVolume, scanningMetadata?: {
    scanMethod: "camera" | "upload";
    isbn: string;
    scanStartTime: number;
  }) => void;
  isAdding?: boolean;
  className?: string;
}

type ScanMode = "camera" | "upload";
type ScanStatus = "idle" | "scanning" | "processing" | "success" | "error";

/**
 * BarcodeScanner Component
 * 
 * Main orchestrator component for barcode scanning functionality.
 * Handles mode switching, ISBN processing, book search, and preview display.
 */
export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onAddBook,
  isAdding = false,
  className,
}) => {
  const [scanMode, setScanMode] = useState<ScanMode>("camera");
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [scannedISBN, setScannedISBN] = useState<string | null>(null);
  const [foundBook, setFoundBook] = useState<GoogleBooksVolume | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanStartTime, setScanStartTime] = useState<number>(0);
  const [debugOpen, setDebugOpen] = useState<boolean>(false);
  
  const { search, isSearching, searchResults, error: searchError, clearError } = useBookSearch();

  // Debug logging helper
  const debugLog = useCallback((type: string, message: string, data?: any) => {
    if (typeof window !== 'undefined' && (window as any).debugScanner) {
      switch (type) {
        case 'scanner_raw':
          (window as any).debugScanner.logRawScan(data);
          break;
        case 'isbn_extracted':
          (window as any).debugScanner.logISBNExtraction(data.input, data.output);
          break;
        case 'google_search':
          (window as any).debugScanner.logGoogleSearch(data.isbn, data.resultCount);
          break;
        case 'error':
          (window as any).debugScanner.logError(message, data);
          break;
        case 'success':
          (window as any).debugScanner.logSuccess(message, data);
          break;
      }
    }
    // Also log to console for development
    console.log(`[BarcodeScanner Debug] ${type}:`, message, data);
  }, []);

  // Log component initialization
  useEffect(() => {
    console.log('[BarcodeScanner] Component mounted');
    debugLog('success', 'BarcodeScanner component initialized');
    return () => {
      console.log('[BarcodeScanner] Component unmounted');
    };
  }, [debugLog]);

  // Handle barcode capture from camera or image
  const handleBarcodeCapture = useCallback(async (rawBarcode: string) => {
    debugLog('scanner_raw', `Received raw barcode data`, rawBarcode);
    
    setScanStartTime(Date.now());
    setScanStatus("processing");
    setErrorMessage(null);
    clearError();

    // Extract ISBN from barcode
    const isbn = extractISBN(rawBarcode);
    debugLog('isbn_extracted', `ISBN extraction completed`, { input: rawBarcode, output: isbn });
    
    if (!isbn) {
      const errorMsg = "No valid ISBN found in barcode. Please try again or enter the book manually.";
      debugLog('error', errorMsg, { rawBarcode });
      setErrorMessage(errorMsg);
      setScanStatus("error");
      return;
    }

    setScannedISBN(isbn);
    debugLog('success', `ISBN successfully extracted: ${isbn}`);

    try {
      // Search for book using ISBN
      debugLog('google_search', `Starting Google Books search for ISBN: ${isbn}`);
      await search(isbn, 5, 'general');
      
      // Note: The search results will be handled in the useEffect below
    } catch (error) {
      const errorMsg = "Failed to search for book. Please check your internet connection and try again.";
      debugLog('error', errorMsg, { isbn, error });
      console.error("Error during book search:", error);
      setErrorMessage(errorMsg);
      setScanStatus("error");
    }
  }, [search, clearError, debugLog]);

  // Handle search results
  useEffect(() => {
    if (scanStatus === "processing" && !isSearching) {
      debugLog('google_search', `Search completed`, { 
        resultCount: searchResults.length, 
        hasError: !!searchError,
        isbn: scannedISBN 
      });
      
      if (searchResults.length > 0) {
        debugLog('success', `Book found in Google Books: ${searchResults[0].volumeInfo.title}`, searchResults[0]);
        setFoundBook(searchResults[0]);
        setScanStatus("success");
      } else if (searchError) {
        const errorMsg = "Failed to search for book. Please try again or check your internet connection.";
        debugLog('error', errorMsg, { searchError, isbn: scannedISBN });
        setErrorMessage(errorMsg);
        setScanStatus("error");
      } else {
        const errorMsg = "Book not found in Google Books. You can add it manually instead.";
        debugLog('error', errorMsg, { isbn: scannedISBN, searchResultCount: searchResults.length });
        setErrorMessage(errorMsg);
        setScanStatus("error");
      }
    }
  }, [scanStatus, isSearching, searchResults, searchError, scannedISBN, debugLog]);

  // Handle scanner errors
  const handleScannerError = useCallback((error: string) => {
    debugLog('error', `Scanner error: ${error}`);
    setErrorMessage(error);
    setScanStatus("error");
  }, [debugLog]);

  // Add book to library
  const handleAddBook = useCallback(() => {
    if (foundBook && scannedISBN) {
      const scanningMetadata = {
        scanMethod: scanMode,
        isbn: scannedISBN,
        scanStartTime,
      };
      
      onAddBook(foundBook, scanningMetadata);
    }
  }, [foundBook, scannedISBN, scanMode, scanStartTime, onAddBook]);

  // Reset scanning state
  const resetScan = useCallback(() => {
    setScanStatus("idle");
    setScannedISBN(null);
    setFoundBook(null);
    setErrorMessage(null);
    clearError();
  }, [clearError]);

  // Switch scan mode
  const handleModeChange = useCallback((mode: ScanMode) => {
    setScanMode(mode);
    resetScan();
  }, [resetScan]);

  const isCameraActive = scanMode === "camera" && scanStatus !== "success";

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Debug Toggle */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDebugOpen(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Bug className="h-4 w-4 mr-1" />
          Debug Console
        </Button>
      </div>

      {/* Mode Selection */}
      <Tabs value={scanMode} onValueChange={handleModeChange as (value: string) => void}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="camera">
            <Camera className="h-4 w-4 mr-2" />
            Camera
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="camera" className="mt-6">
          <CameraScanner
            onCapture={handleBarcodeCapture}
            onError={handleScannerError}
            isActive={isCameraActive}
            className="w-full"
          />
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          <ImageUploader
            onCapture={handleBarcodeCapture}
            onError={handleScannerError}
            className="w-full"
          />
        </TabsContent>
      </Tabs>

      {/* Status Messages */}
      {scanStatus === "processing" && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <div className="text-center">
                <p className="font-medium">Processing barcode...</p>
                {scannedISBN && (
                  <p className="text-sm">
                    ISBN: <Badge variant="outline" className="ml-1">{scannedISBN}</Badge>
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {scanStatus === "error" && errorMessage && (
        <Card className="border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive mb-2">Scanning Error</p>
                <p className="text-sm text-muted-foreground mb-3">{errorMessage}</p>
                <div className="flex gap-2">
                  <Button 
                    onClick={resetScan} 
                    variant="outline" 
                    size="sm"
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/add-books?tab=manual'} 
                    variant="outline" 
                    size="sm"
                  >
                    Add Manually
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success State - Book Preview */}
      {scanStatus === "success" && foundBook && (
        <div className="space-y-4">
          <Card className="border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-medium">Book found!</p>
                {scannedISBN && (
                  <Badge variant="outline" className="ml-auto">
                    ISBN: {scannedISBN}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <BookPreviewCard
            book={foundBook}
            onAddBook={handleAddBook}
            isAdding={isAdding}
            className="shadow-lg"
          />

          <div className="flex justify-center">
            <Button 
              onClick={resetScan} 
              variant="outline"
              disabled={isAdding}
            >
              Scan Another Book
            </Button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {scanStatus === "idle" && (
        <Card>
          <CardContent className="p-4">
            <div className="text-center text-muted-foreground">
              <h3 className="font-semibold text-foreground mb-2">
                {scanMode === "camera" ? "Scan Book Barcode" : "Upload Barcode Image"}
              </h3>
              <p className="text-sm mb-3">
                {scanMode === "camera" 
                  ? "Position your camera over a book's ISBN barcode. The barcode will be detected automatically."
                  : "Select an image containing a book's ISBN barcode from your device."
                }
              </p>
              <div className="text-xs">
                <p className="font-medium mb-1">Supported formats:</p>
                <p>ISBN-10, ISBN-13, EAN-13, UPC-A</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Overlay */}
      <DebugOverlay
        isOpen={debugOpen}
        onClose={() => setDebugOpen(false)}
      />
    </div>
  );
};

export default BarcodeScanner;