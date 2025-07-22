# ISBN Barcode Scanner Implementation Guide

This guide explains how to implement the `react-barcode-scanner` library for scanning ISBN barcodes on books in a React/Next.js project.

## Prerequisites

- React 18+ or Next.js project
- TypeScript support (recommended)
- Modern browser with camera access

## Installation

```bash
npm install react-barcode-scanner
```

## Configuration

### 1. Import Required Components and Types

```tsx
import { useState } from "react";
import {
  BarcodeFormat,
  BarcodeScanner,
  DetectedBarcode,
} from "react-barcode-scanner";
import "react-barcode-scanner/polyfill";
```

### 2. Set Up State Management

```tsx
const [scannedData, setScannedData] = useState<string>("");
```

### 3. Create Capture Handler

```tsx
const handleCapture = (barcodes: DetectedBarcode[]) => {
  if (barcodes && barcodes.length > 0) {
    setScannedData(barcodes[0].rawValue);
  }
};
```

### 4. Implement Scanner Component

```tsx
<BarcodeScanner
  onCapture={handleCapture}
  options={{
    formats: [
      BarcodeFormat.EAN_13,    // Primary ISBN-13 format
      BarcodeFormat.UPC_A,     // Older books/US publications
      BarcodeFormat.CODE_128,  // Internal book codes
    ],
    delay: 500, // Scan every 500ms
  }}
  style={{
    width: "100%",
    height: "300px",
  }}
/>
```

## Complete Implementation Example

```tsx
'use client';

import { useState } from "react";
import {
  BarcodeFormat,
  BarcodeScanner,
  DetectedBarcode,
} from "react-barcode-scanner";
import "react-barcode-scanner/polyfill";

export default function BookScanner() {
  const [scannedData, setScannedData] = useState<string>("");

  const handleCapture = (barcodes: DetectedBarcode[]) => {
    if (barcodes && barcodes.length > 0) {
      setScannedData(barcodes[0].rawValue);
    }
  };

  return (
    <div className="scanner-container">
      <BarcodeScanner
        onCapture={handleCapture}
        options={{
          formats: [
            BarcodeFormat.EAN_13,
            BarcodeFormat.UPC_A,
            BarcodeFormat.CODE_128,
          ],
          delay: 500,
        }}
        style={{
          width: "100%",
          height: "300px",
        }}
      />
      
      {scannedData && (
        <div className="scanned-result">
          <h3>ISBN Found:</h3>
          <p>{scannedData}</p>
        </div>
      )}
    </div>
  );
}
```

## Migration from Other Libraries

### From react-qr-barcode-scanner

**Old Implementation:**
```tsx
import QrReader from 'react-qr-barcode-scanner';

<QrReader
  delay={300}
  onResult={(result, error) => {
    if (result) {
      setData(result?.text);
    }
  }}
/>
```

**New Implementation:**
```tsx
import { BarcodeScanner, BarcodeFormat } from 'react-barcode-scanner';

<BarcodeScanner
  onCapture={(barcodes) => {
    if (barcodes && barcodes.length > 0) {
      setData(barcodes[0].rawValue);
    }
  }}
  options={{
    formats: [BarcodeFormat.EAN_13, BarcodeFormat.UPC_A, BarcodeFormat.CODE_128],
    delay: 500,
  }}
/>
```

### From @zxing/library

**Old Implementation:**
```tsx
import { BrowserMultiFormatReader } from '@zxing/library';

const codeReader = new BrowserMultiFormatReader();
codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', (result, err) => {
  if (result) {
    setResult(result.getText());
  }
});
```

**New Implementation:**
```tsx
import { BarcodeScanner, BarcodeFormat } from 'react-barcode-scanner';

<BarcodeScanner
  onCapture={(barcodes) => {
    if (barcodes && barcodes.length > 0) {
      setResult(barcodes[0].rawValue);
    }
  }}
  options={{
    formats: [BarcodeFormat.EAN_13, BarcodeFormat.UPC_A, BarcodeFormat.CODE_128]
  }}
/>
```

## Configuration Options

### Supported Book-Related Formats

- `BarcodeFormat.EAN_13` - Most modern ISBN-13 barcodes
- `BarcodeFormat.UPC_A` - Older books and US publications  
- `BarcodeFormat.CODE_128` - Internal book codes and special editions
- `BarcodeFormat.EAN_8` - Short EAN codes (less common for books)

### Scanner Options

```tsx
options={{
  formats: [BarcodeFormat.EAN_13, BarcodeFormat.UPC_A, BarcodeFormat.CODE_128],
  delay: 500, // Milliseconds between scans (default: 1000)
}}
```

### Additional Props

```tsx
<BarcodeScanner
  onCapture={handleCapture}
  options={scanOptions}
  style={{ width: "100%", height: "300px" }}
  trackConstraints={{ facingMode: "environment" }} // Use back camera
  paused={false} // Pause/resume scanning
/>
```

## Best Practices

1. **Always import the polyfill**: Required for cross-browser compatibility
2. **Use appropriate formats**: Only include formats you need for better performance
3. **Handle permissions**: Request camera permissions gracefully
4. **Optimize delay**: 500ms works well for most use cases
5. **Style appropriately**: Set explicit width/height for consistent UI
6. **Error handling**: Always check if barcodes array has results

## Troubleshooting

### Common Issues

1. **Camera not working**: Ensure HTTPS in production
2. **No scans detected**: Check lighting and barcode quality
3. **Multiple scans**: Use debouncing or disable scanner after successful scan
4. **TypeScript errors**: Import types from the package

### Browser Support

- Chrome 88+
- Firefox 90+
- Safari 14+
- Edge 88+

## Performance Considerations

- The scanner runs continuously when mounted
- Consider pausing when not needed: `paused={true}`
- Unmount component when navigating away
- Use `delay` option to control scan frequency

## Next Steps

After implementing the basic scanner:

1. Add loading states
2. Implement error handling
3. Add scan success feedback
4. Consider adding flashlight toggle
5. Implement ISBN validation
6. Add book lookup integration