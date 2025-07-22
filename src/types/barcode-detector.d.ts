declare global {
  interface Window {
    BarcodeDetector: typeof BarcodeDetector;
  }
}

interface BarcodeDetectorOptions {
  formats: string[];
}

interface DetectedBarcode {
  boundingBox: DOMRectReadOnly;
  cornerPoints: DOMPointReadOnly[];
  format: string;
  rawValue: string;
}

declare class BarcodeDetector {
  constructor(options?: BarcodeDetectorOptions);
  detect(imageSource: ImageBitmapSource): Promise<DetectedBarcode[]>;
}

export {};
