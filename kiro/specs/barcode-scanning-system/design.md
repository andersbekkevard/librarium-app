# Design Document

## Overview

The Barcode Scanning System extends the existing AddBooksPage with a streamlined "Scan" tab that leverages react-zxing's built-in capabilities. The design eliminates redundant layers by using the library's native camera management, permission handling, and barcode detection while maintaining the established service layer architecture and Notion-style UI consistency.

## Architecture

### Simplified Architecture

The streamlined barcode scanning system follows the established service layer architecture with minimal additional layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
├─────────────────────────────────────────────────────────────┤
│  📱 BarcodeScanner Component                               │
│  ├── useZxing hook (camera + detection)                    │
│  ├── ScanningOverlay (visual guidance)                     │
│  ├── ImageUpload (BrowserMultiFormatReader)                │
│  └── BookPreviewCard (reused from existing)               │
├─────────────────────────────────────────────────────────────┤
│  🔄 Enhanced AddBooksPage                                  │
│  └── New Scan Tab (BarcodeScanner)                        │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                          │
├─────────────────────────────────────────────────────────────┤
│  🧠 Enhanced BookService                                   │
│  └── addBookFromISBN(userId, isbn)                        │
├─────────────────────────────────────────────────────────────┤
│  🔧 ISBN Utilities (pure functions)                       │
│  ├── extractISBN(barcodeText)                             │
│  └── validateISBN(isbn)                                   │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  External Services                          │
├─────────────────────────────────────────────────────────────┤
│  📚 Google Books API (existing)                           │
│  └── searchByISBN(isbn)                                   │
├─────────────────────────────────────────────────────────────┤
│  📷 react-zxing Library                                   │
│  ├── useZxing hook (camera + detection + permissions)     │
│  └── BrowserMultiFormatReader (image processing)          │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Core Components

#### 1. BarcodeScanner Component

**Purpose:** Main container that orchestrates scanning with minimal state

**Simplified State:**
```typescript
interface BarcodeScannerState {
  mode: 'camera' | 'upload';
  status: 'idle' | 'processing' | 'success' | 'error';
  foundBook: GoogleBooksVolume | null;
  error: string | null;
}
```

**Implementation:**
```typescript
const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onBookFound,
  onError,
  isAdding
}) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [foundBook, setFoundBook] = useState<GoogleBooksVolume | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBarcodeDetected = async (barcodeText: string) => {
    setStatus('processing');
    
    const isbn = extractISBN(barcodeText);
    if (!isbn || !validateISBN(isbn)) {
      setError('Invalid barcode format. Please scan a book ISBN.');
      setStatus('error');
      return;
    }

    try {
      const books = await googleBooksApi.searchByISBN(isbn, 1);
      if (books.length === 0) {
        setError('Book not found. You can add it manually instead.');
        setStatus('error');
        return;
      }

      setFoundBook(books[0]);
      setStatus('success');
    } catch (error) {
      setError('Failed to find book information. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'camera' ? 'default' : 'outline'}
          onClick={() => setMode('camera')}
          className="flex-1"
        >
          <Camera className="h-4 w-4 mr-2" />
          Camera
        </Button>
        <Button
          variant={mode === 'upload' ? 'default' : 'outline'}
          onClick={() => setMode('upload')}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Image
        </Button>
      </div>

      {/* Scanning Interface */}
      {mode === 'camera' ? (
        <CameraScanner
          onBarcodeDetected={handleBarcodeDetected}
          onError={setError}
          paused={status === 'success'}
        />
      ) : (
        <ImageUploader
          onBarcodeDetected={handleBarcodeDetected}
          onError={setError}
          isProcessing={status === 'processing'}
        />
      )}

      {/* Results */}
      {status === 'success' && foundBook && (
        <BookPreviewCard
          book={foundBook}
          onAddBook={() => onBookFound(foundBook)}
          isAdding={isAdding}
        />
      )}

      {/* Error Display */}
      {error && (
        <ErrorAlert error={error} onDismiss={() => setError(null)} />
      )}
    </div>
  );
};
```

#### 2. CameraScanner Component

**Purpose:** Minimal wrapper around useZxing hook with visual overlay

**Implementation:**
```typescript
const CameraScanner: React.FC<CameraScannerProps> = ({
  onBarcodeDetected,
  onError,
  paused
}) => {
  const { ref, torch } = useZxing({
    paused,
    onDecodeResult: (result) => {
      onBarcodeDetected(result.getText());
    },
    onDecodeError: (error) => {
      // Silent - react-zxing handles retries automatically
      console.debug('Barcode decode attempt:', error);
    },
    onError: (error) => {
      onError(mapCameraError(error));
    },
    constraints: {
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    }
  });

  return (
    <div className="relative">
      <video
        ref={ref}
        className="w-full h-64 object-cover rounded-lg bg-muted"
        playsInline
        muted
      />
      <ScanningOverlay />
      {torch.isAvailable && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4"
          onClick={torch.isOn ? torch.off : torch.on}
        >
          {torch.isOn ? (
            <FlashlightOff className="h-4 w-4" />
          ) : (
            <Flashlight className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
};
```

#### 3. ImageUploader Component

**Purpose:** Simplified image upload using BrowserMultiFormatReader directly

**Implementation:**
```typescript
const ImageUploader: React.FC<ImageUploaderProps> = ({
  onBarcodeDetected,
  onError,
  isProcessing
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  const processImage = async (file: File) => {
    try {
      const reader = new BrowserMultiFormatReader();
      const result = await reader.decodeFromImageElement(file);
      onBarcodeDetected(result.getText());
    } catch (error) {
      onError('No barcode detected in image. Please try a clearer image.');
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      onError('File too large. Please select an image under 10MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    processImage(file);

    // Cleanup
    setTimeout(() => URL.revokeObjectURL(previewUrl), 1000);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
          id="barcode-image-upload"
        />
        <label
          htmlFor="barcode-image-upload"
          className="cursor-pointer flex flex-col items-center space-y-2"
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Click to upload barcode image
          </span>
        </label>
      </div>
      
      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Selected barcode"
            className="w-full h-32 object-contain rounded-lg border"
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

#### 4. ScanningOverlay Component

**Purpose:** Pure visual component for scanning guidance

**Implementation:**
```typescript
const ScanningOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative">
        {/* Scanning frame */}
        <div className="w-64 h-32 border-2 border-primary/60 rounded-lg relative">
          {/* Corner indicators */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-lg" />
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-lg" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-lg" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-lg" />
        </div>
        
        {/* Instructions */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          Position barcode within the frame
        </p>
      </div>
    </div>
  );
};
```

## Service Layer Components

### ISBN Utilities (Pure Functions)

**Purpose:** Lightweight utility functions instead of service class

```typescript
// src/lib/utils/isbn-utils.ts

/**
 * Extracts ISBN from various barcode formats
 */
export function extractISBN(barcodeText: string): string | null {
  const digits = barcodeText.replace(/\D/g, '');
  
  // ISBN-13 (EAN-13 starting with 978/979)
  if (digits.length === 13 && (digits.startsWith('978') || digits.startsWith('979'))) {
    return digits;
  }
  
  // ISBN-10
  if (digits.length === 10) {
    return digits;
  }
  
  // UPC-A with leading zero
  if (digits.length === 12 && digits.startsWith('0')) {
    return digits.substring(1);
  }
  
  return null;
}

/**
 * Validates ISBN format using checksum
 */
export function validateISBN(isbn: string): boolean {
  if (isbn.length === 10) {
    return validateISBN10(isbn);
  } else if (isbn.length === 13) {
    return validateISBN13(isbn);
  }
  return false;
}

function validateISBN10(isbn: string): boolean {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(isbn[i]) * (10 - i);
  }
  const checkDigit = isbn[9] === 'X' ? 10 : parseInt(isbn[9]);
  return (sum + checkDigit) % 11 === 0;
}

function validateISBN13(isbn: string): boolean {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(isbn[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = parseInt(isbn[12]);
  return (sum + checkDigit) % 10 === 0;
}
```

### Enhanced BookService

**Purpose:** Single method addition to existing service

```typescript
export class BookService {
  // ... existing methods

  /**
   * Adds a book from ISBN by searching Google Books API
   */
  async addBookFromISBN(userId: string, isbn: string): Promise<ServiceResult<string>> {
    try {
      const books = await googleBooksApi.searchByISBN(isbn, 1);
      
      if (books.length === 0) {
        return {
          success: false,
          error: 'Book not found for this ISBN'
        };
      }

      const book = convertGoogleBookToBook(books[0]);
      const { id: _id, ...bookData } = book;
      
      return await this.addBook(userId, bookData);
    } catch (error) {
      return {
        success: false,
        error: 'Failed to add book from ISBN'
      };
    }
  }
}
```

## Data Models

### Minimal State Models

```typescript
/**
 * Scanning mode and status
 */
export type ScanMode = 'camera' | 'upload';
export type ScanStatus = 'idle' | 'processing' | 'success' | 'error';

/**
 * Camera error mapping
 */
export function mapCameraError(error: Error): string {
  switch (error.name) {
    case 'NotAllowedError':
      return 'Camera permission denied. Please enable camera access in your browser settings.';
    case 'NotFoundError':
      return 'No camera found. Please use image upload instead.';
    case 'NotReadableError':
      return 'Camera is busy. Please try again or use image upload.';
    default:
      return 'Camera error occurred. Please try image upload instead.';
  }
}
```

## Error Handling

### Simplified Error Strategy

**react-zxing handles most errors automatically:**
- Camera permissions via `onError` callback
- Barcode detection retries via `timeBetweenDecodingAttempts`
- Resource cleanup via internal `reader.reset()`

**Our error handling focuses on:**
1. **User-friendly messages** - Map technical errors to actionable feedback
2. **Fallback options** - Always offer alternative (manual entry, image upload)
3. **Recovery mechanisms** - Clear error states and retry options

```typescript
// src/lib/utils/scanning-errors.ts
export function handleScanningError(error: unknown, context: 'camera' | 'upload' | 'search'): string {
  if (context === 'camera') {
    return mapCameraError(error as Error);
  } else if (context === 'upload') {
    return 'No barcode detected in image. Please try a clearer image with better lighting.';
  } else if (context === 'search') {
    return 'Book not found in our database. You can add it manually instead.';
  }
  return 'Something went wrong. Please try again.';
}
```

## Testing Strategy

### Simplified Testing Approach

**Unit Tests:**
- ISBN utility functions (pure functions are easy to test)
- Error mapping functions
- Component rendering with mocked hooks

**Integration Tests:**
- Mock `useZxing` hook for camera testing
- Mock `BrowserMultiFormatReader` for image processing
- Mock Google Books API responses

**Example Test:**
```typescript
// Mock react-zxing
jest.mock('react-zxing', () => ({
  useZxing: jest.fn(() => ({
    ref: { current: null },
    torch: { isAvailable: false, isOn: false, on: jest.fn(), off: jest.fn() }
  }))
}));

describe('BarcodeScanner', () => {
  it('should handle successful barcode detection', async () => {
    const mockOnBookFound = jest.fn();
    const mockUseZxing = useZxing as jest.MockedFunction<typeof useZxing>;
    
    mockUseZxing.mockReturnValue({
      ref: { current: null },
      torch: { isAvailable: false, isOn: false, on: jest.fn(), off: jest.fn() }
    });

    render(<BarcodeScanner onBookFound={mockOnBookFound} />);
    
    // Simulate barcode detection
    const { onDecodeResult } = mockUseZxing.mock.calls[0][0];
    onDecodeResult({ getText: () => '9781234567890' });
    
    await waitFor(() => {
      expect(mockOnBookFound).toHaveBeenCalled();
    });
  });
});
```

## Performance Considerations

### Leveraging react-zxing Optimizations

**Built-in optimizations:**
- Automatic camera resource management
- Throttled barcode detection (300ms default)
- Automatic pause/resume functionality
- Memory cleanup via internal `reader.reset()`

**Our optimizations:**
- Pause scanning after successful detection: `paused={status === 'success'}`
- File size validation for uploads: `file.size > 10MB`
- Immediate URL cleanup: `setTimeout(() => URL.revokeObjectURL(url), 1000)`

## Security and Privacy

### Built-in Privacy Protection

**react-zxing provides:**
- No video recording or storage
- Local-only barcode processing
- Automatic camera resource cleanup

**Our additions:**
- File size limits for uploads
- Local-only image processing
- Clear permission request messaging
- Immediate cleanup of temporary URLs

## Accessibility

### Screen Reader Support

```typescript
// Accessible scanning overlay
<div 
  className="absolute inset-0 flex items-center justify-center pointer-events-none"
  role="img"
  aria-label="Barcode scanning area"
>
  <div className="w-64 h-32 border-2 border-primary/60 rounded-lg relative">
    {/* Visual indicators */}
  </div>
  <p className="text-center text-sm text-muted-foreground mt-4">
    Position barcode within the frame
  </p>
</div>

// Status announcements
<div aria-live="polite" className="sr-only">
  {status === 'processing' && 'Searching for book information...'}
  {status === 'success' && 'Book found! Review details below.'}
  {status === 'error' && error}
</div>
```

## Future Enhancements

### Potential Improvements

1. **Native Barcode Detection API** - Replace react-zxing when browser support improves
2. **Batch Scanning** - Scan multiple books in sequence
3. **Smart Detection** - Auto-focus and multiple format support
4. **Offline Support** - Cache common ISBN patterns

### Migration Path

The simplified architecture makes future enhancements easier:
- Pure utility functions can be easily replaced or extended
- Minimal state reduces migration complexity
- Clear separation allows for gradual feature additions