"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleBooksVolume } from "@/lib/api/google-books-api";
import { useBookSearch } from "@/lib/hooks/useBookSearch";
import { extractISBN } from "@/lib/utils/isbn-utils";
import { cn } from "@/lib/utils/utils";
import { AlertCircle, Camera, Loader2, Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { BookSearchCard } from "../BookSearchCard";
import { CameraScanner } from "./CameraScanner";
import { ImageUploader } from "./ImageUploader";

interface BarcodeScannerProps {
  onAddBook: (
    book: GoogleBooksVolume,
    scanningMetadata?: {
      scanMethod: "camera" | "upload";
      isbn: string;
      scanStartTime: number;
    }
  ) => void;
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

  const {
    search,
    isSearching,
    searchResults,
    error: searchError,
    clearError,
  } = useBookSearch();

  // Handle barcode capture from camera or image
  const handleBarcodeCapture = useCallback(
    async (rawBarcode: string) => {
      setScanStartTime(Date.now());
      setScanStatus("processing");
      setErrorMessage(null);
      clearError();

      // Extract ISBN from barcode
      const isbn = extractISBN(rawBarcode);

      if (!isbn) {
        const errorMsg =
          "No valid ISBN found in barcode. Please try again or enter the book manually.";
        setErrorMessage(errorMsg);
        setScanStatus("error");
        return;
      }

      setScannedISBN(isbn);

      try {
        // Search for book using ISBN
        await search(isbn, 5, "isbn");

        // Note: The search results will be handled in the useEffect below
      } catch {
        const errorMsg =
          "Failed to search for book. Please check your internet connection and try again.";
        setErrorMessage(errorMsg);
        setScanStatus("error");
      }
    },
    [search, clearError]
  );

  // Handle search results
  useEffect(() => {
    if (scanStatus === "processing" && !isSearching) {
      if (searchResults.length > 0) {
        setFoundBook(searchResults[0]);
        setScanStatus("success");
      } else if (searchError) {
        const errorMsg =
          "Failed to search for book. Please try again or check your internet connection.";
        setErrorMessage(errorMsg);
        setScanStatus("error");
      } else {
        const errorMsg =
          "Book not found in Google Books. You can add it manually instead.";
        setErrorMessage(errorMsg);
        setScanStatus("error");
      }
    }
  }, [scanStatus, isSearching, searchResults, searchError, scannedISBN]);

  // Handle scanner errors
  const handleScannerError = useCallback((error: string) => {
    setErrorMessage(error);
    setScanStatus("error");
  }, []);

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
  const handleModeChange = useCallback(
    (mode: ScanMode) => {
      setScanMode(mode);
      resetScan();
    },
    [resetScan]
  );

  const isCameraActive = scanMode === "camera" && scanStatus !== "success";

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Mode Selection */}
      <Tabs
        value={scanMode}
        onValueChange={handleModeChange as (value: string) => void}
      >
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
          <div className="flex gap-4 h-96">
            <div className="flex-1">
              {scanStatus === "success" && foundBook ? (
                <BookSearchCard
                  book={foundBook}
                  onAddBook={handleAddBook}
                  isAdded={false}
                  isAdding={isAdding}
                  showDescription={true}
                  className="h-full"
                />
              ) : (
                <CameraScanner
                  onCapture={handleBarcodeCapture}
                  onError={handleScannerError}
                  isActive={isCameraActive}
                  className="w-full h-full"
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          <div className="flex gap-4 h-96">
            <div className="flex-1">
              {scanStatus === "success" && foundBook ? (
                <BookSearchCard
                  book={foundBook}
                  onAddBook={handleAddBook}
                  isAdded={false}
                  isAdding={isAdding}
                  showDescription={true}
                  className="h-full"
                />
              ) : (
                <ImageUploader
                  onCapture={handleBarcodeCapture}
                  onError={handleScannerError}
                  className="w-full h-full"
                />
              )}
            </div>
          </div>
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
                    ISBN:{" "}
                    <Badge variant="outline" className="ml-1">
                      {scannedISBN}
                    </Badge>
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
                <p className="text-sm font-medium text-destructive mb-2">
                  Scanning Error
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  {errorMessage}
                </p>
                <div className="flex gap-2">
                  <Button onClick={resetScan} variant="outline" size="sm">
                    Try Again
                  </Button>
                  <Button
                    onClick={() =>
                      (window.location.href = "/add-books?tab=manual")
                    }
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

      {/* Success State - Scan Another Button */}
      {scanStatus === "success" && foundBook && (
        <div className="flex justify-center">
          <Button onClick={resetScan} variant="outline" disabled={isAdding}>
            Scan Another Book
          </Button>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
