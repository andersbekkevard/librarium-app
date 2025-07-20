/**
 * Browser Compatibility and Security Utilities
 * 
 * Provides functions to check browser capabilities, security context,
 * and compatibility for camera and barcode scanning features.
 */

/**
 * Check if the browser supports camera access
 * Enhanced to handle various browser quirks and mobile Safari issues
 */
export function isCameraSupported(): boolean {
  // Check for modern MediaDevices API
  if (
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  ) {
    return true;
  }

  // Fallback check for older browsers and mobile Safari
  // Some versions of Safari have partial MediaDevices support
  if (navigator && typeof navigator.getUserMedia === 'function') {
    return true;
  }

  // Check vendor-prefixed versions (legacy support)
  const getUserMedia = (
    navigator.getUserMedia ||
    (navigator as any).webkitGetUserMedia ||
    (navigator as any).mozGetUserMedia ||
    (navigator as any).msGetUserMedia
  );

  return typeof getUserMedia === 'function';
}

/**
 * Check if the current context is secure (HTTPS or localhost)
 */
export function isSecureContext(): boolean {
  return (
    window.isSecureContext ||
    location.protocol === 'https:' ||
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.hostname === '::1'
  );
}

/**
 * Check if the browser is iOS Safari
 */
export function isIOSSafari(): boolean {
  const userAgent = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(userAgent) && /Safari/.test(userAgent);
}

/**
 * Check if the browser is running on iOS (Safari or Chrome)
 */
export function isIOS(): boolean {
  const userAgent = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(userAgent);
}

/**
 * Check if the browser is Chrome on iOS
 */
export function isIOSChrome(): boolean {
  const userAgent = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(userAgent) && /CriOS/.test(userAgent);
}

/**
 * Check if MediaDevices API is properly available
 * This addresses the specific issue with Safari mobile where
 * navigator.mediaDevices might be undefined
 */
export function isMediaDevicesAvailable(): boolean {
  return !!(
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices === 'object'
  );
}

/**
 * Get a polyfilled version of getUserMedia that works across browsers
 */
export function getGetUserMedia(): ((constraints: MediaStreamConstraints) => Promise<MediaStream>) | null {
  // Modern standard API
  if (isMediaDevicesAvailable() && navigator.mediaDevices.getUserMedia) {
    return (constraints: MediaStreamConstraints) => navigator.mediaDevices.getUserMedia(constraints);
  }

  // Legacy API fallback
  const legacyGetUserMedia = (
    navigator.getUserMedia ||
    (navigator as any).webkitGetUserMedia ||
    (navigator as any).mozGetUserMedia ||
    (navigator as any).msGetUserMedia
  );

  if (legacyGetUserMedia) {
    return (constraints: MediaStreamConstraints) => {
      return new Promise((resolve, reject) => {
        legacyGetUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }

  return null;
}

/**
 * Check if the browser supports file upload
 */
export function isFileUploadSupported(): boolean {
  return !!(
    window.File &&
    window.FileReader &&
    window.FileList &&
    window.Blob &&
    typeof URL !== 'undefined' &&
    typeof URL.createObjectURL === 'function'
  );
}

/**
 * Check if the browser supports modern JavaScript features needed
 */
export function isModernBrowserSupported(): boolean {
  return !!(
    typeof Promise !== 'undefined' &&
    typeof async function() {} === 'function' &&
    typeof Map !== 'undefined' &&
    typeof Set !== 'undefined'
  );
}

/**
 * Get browser information for debugging
 */
export function getBrowserInfo(): {
  userAgent: string;
  isSecure: boolean;
  cameraSupport: boolean;
  fileSupport: boolean;
  modernJS: boolean;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
} {
  const userAgent = navigator.userAgent;
  
  return {
    userAgent,
    isSecure: isSecureContext(),
    cameraSupport: isCameraSupported(),
    fileSupport: isFileUploadSupported(),
    modernJS: isModernBrowserSupported(),
    isMobile: /Mobi|Android/i.test(userAgent),
    isIOS: /iPad|iPhone|iPod/.test(userAgent),
    isAndroid: /Android/.test(userAgent)
  };
}

/**
 * Get detailed camera capabilities
 */
export async function getCameraCapabilities(): Promise<{
  hasCamera: boolean;
  cameraCount: number;
  frontCamera: boolean;
  backCamera: boolean;
  torchSupport: boolean;
  error?: string;
}> {
  if (!isCameraSupported()) {
    return {
      hasCamera: false,
      cameraCount: 0,
      frontCamera: false,
      backCamera: false,
      torchSupport: false,
      error: 'MediaDevices API not supported'
    };
  }

  // Special handling for iOS browsers where mediaDevices might be undefined
  if (!isMediaDevicesAvailable()) {
    // On iOS (Safari or Chrome), assume camera is available but can't enumerate
    if (isIOS()) {
      const browserType = isIOSChrome() ? 'iOS Chrome' : 'iOS Safari';
      return {
        hasCamera: true,
        cameraCount: 1,
        frontCamera: true,
        backCamera: true,
        torchSupport: false,
        error: `Camera enumeration not available on ${browserType}`
      };
    }
    
    return {
      hasCamera: false,
      cameraCount: 0,
      frontCamera: false,
      backCamera: false,
      torchSupport: false,
      error: 'MediaDevices API not available'
    };
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    // Check for front/back cameras based on labels
    const frontCamera = videoDevices.some(device => 
      device.label.toLowerCase().includes('front') ||
      device.label.toLowerCase().includes('user')
    );
    
    const backCamera = videoDevices.some(device => 
      device.label.toLowerCase().includes('back') ||
      device.label.toLowerCase().includes('rear') ||
      device.label.toLowerCase().includes('environment')
    );

    // Note: Torch support detection requires actual camera access
    // This is a basic heuristic - real detection happens in camera components
    const torchSupport = backCamera && /Android|iPhone|iPad/.test(navigator.userAgent);

    return {
      hasCamera: videoDevices.length > 0,
      cameraCount: videoDevices.length,
      frontCamera,
      backCamera,
      torchSupport,
    };
  } catch (error) {
    // Fallback for iOS browsers and other browsers that fail enumeration
    if (isIOS()) {
      const browserType = isIOSChrome() ? 'iOS Chrome' : 'iOS Safari';
      return {
        hasCamera: true,
        cameraCount: 1,
        frontCamera: true,
        backCamera: true,
        torchSupport: false,
        error: `Camera enumeration failed on ${browserType}`
      };
    }
    
    return {
      hasCamera: false,
      cameraCount: 0,
      frontCamera: false,
      backCamera: false,
      torchSupport: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generate a comprehensive compatibility report
 */
export async function generateCompatibilityReport(): Promise<{
  browser: ReturnType<typeof getBrowserInfo>;
  camera: Awaited<ReturnType<typeof getCameraCapabilities>>;
  recommendations: string[];
  warnings: string[];
  errors: string[];
}> {
  const browser = getBrowserInfo();
  const camera = await getCameraCapabilities();
  
  const recommendations: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  // Security checks
  if (!browser.isSecure) {
    errors.push('Insecure context detected. Camera access requires HTTPS in production.');
    recommendations.push('Use HTTPS or access via localhost for camera scanning.');
  }

  // Browser compatibility
  if (!browser.modernJS) {
    errors.push('Browser does not support modern JavaScript features.');
    recommendations.push('Please update to a modern browser (Chrome 60+, Firefox 55+, Safari 11+).');
  }

  if (!browser.cameraSupport) {
    warnings.push('Camera access not supported in this browser.');
    recommendations.push('Use image upload for barcode scanning instead.');
  }

  if (!browser.fileSupport) {
    errors.push('File upload not supported in this browser.');
    recommendations.push('Please update to a modern browser for full functionality.');
  }

  // Camera-specific checks
  if (camera.error) {
    warnings.push(`Camera enumeration failed: ${camera.error}`);
  }

  if (!camera.hasCamera) {
    warnings.push('No camera detected on this device.');
    recommendations.push('Use image upload for barcode scanning.');
  } else if (camera.cameraCount === 1) {
    warnings.push('Only one camera detected. Limited scanning options available.');
  }

  if (!camera.backCamera && camera.frontCamera) {
    warnings.push('Only front camera detected. Back camera recommended for barcode scanning.');
  }

  // Mobile-specific recommendations and iOS-specific issues
  if (browser.isMobile) {
    recommendations.push('For best results on mobile: ensure good lighting and hold device steady.');
    
    if (browser.isIOS) {
      warnings.push('iOS devices may have limited torch/flashlight support.');
      warnings.push('iOS Safari and Chrome may have MediaDevices API limitations.');
      
      if (!browser.isSecure) {
        errors.push('iOS requires HTTPS for camera access. Camera scanning will not work over HTTP.');
        recommendations.push('Access the site via HTTPS to enable camera scanning on iOS.');
      }
      
      if (!browser.cameraSupport || camera.error) {
        warnings.push('Camera access may be limited on iOS. Try using image upload instead.');
        recommendations.push('If camera scanning fails, use the "Upload Image" option to scan barcodes from your photo gallery.');
      }
    }
  }

  // Add specific guidance for common iOS issues
  if (browser.isIOS && !browser.isSecure) {
    recommendations.push('To enable camera scanning on iOS: 1) Use HTTPS, 2) Grant camera permission when prompted, 3) Try refreshing the page if camera fails to load.');
  }

  return {
    browser,
    camera,
    recommendations,
    warnings,
    errors
  };
}

/**
 * Check if barcode scanning is likely to work in current environment
 */
export async function canScanBarcodes(): Promise<{
  camera: boolean;
  upload: boolean;
  reasons: string[];
}> {
  const report = await generateCompatibilityReport();
  
  const cameraWorks = (
    report.browser.isSecure &&
    report.browser.cameraSupport &&
    report.browser.modernJS &&
    report.camera.hasCamera &&
    !report.camera.error
  );

  const uploadWorks = (
    report.browser.fileSupport &&
    report.browser.modernJS
  );

  const reasons: string[] = [];
  
  if (!cameraWorks) {
    if (!report.browser.isSecure) reasons.push('Insecure context (HTTPS required)');
    if (!report.browser.cameraSupport) reasons.push('Camera API not supported');
    if (!report.camera.hasCamera) reasons.push('No camera detected');
    if (report.camera.error) reasons.push(`Camera error: ${report.camera.error}`);
  }

  if (!uploadWorks) {
    if (!report.browser.fileSupport) reasons.push('File upload not supported');
    if (!report.browser.modernJS) reasons.push('Modern JavaScript not supported');
  }

  return {
    camera: cameraWorks,
    upload: uploadWorks,
    reasons
  };
}