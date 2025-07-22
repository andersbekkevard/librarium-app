import {
  mapCameraError,
  handleBarcodeDetectionError,
  getBarcodeQualityTips,
  handleBookLookupError,
  ScanningError,
} from '../scanning-errors';

describe('mapCameraError', () => {
  it('should handle permission denied errors', () => {
    const errors = [
      { message: 'Permission denied' },
      { name: 'NotAllowedError' },
      'Permission denied by user',
      { message: 'access denied' },
    ];

    errors.forEach(error => {
      const result = mapCameraError(error);
      expect(result.message).toContain('Camera access denied');
      expect(result.suggestions).toContain("Click the camera icon in your browser's address bar");
      expect(result.canRetry).toBe(true);
    });
  });

  it('should handle camera not found errors', () => {
    const errors = [
      { message: 'NotFoundError' },
      { name: 'DeviceNotFoundError' },
      'No camera found',
      { message: 'no camera available' },
    ];

    errors.forEach(error => {
      const result = mapCameraError(error);
      expect(result.message).toContain('No camera found');
      expect(result.suggestions).toContain('Try using the image upload option instead');
      expect(result.canRetry).toBe(false);
    });
  });

  it('should handle constraint/overconstrained errors', () => {
    const errors = [
      { message: 'OverconstrainedError' },
      { name: 'ConstraintNotSatisfiedError' },
      'constraint not satisfied',
      { message: 'overconstrained request' },
    ];

    errors.forEach(error => {
      const result = mapCameraError(error);
      expect(result.message).toContain('Camera configuration issue');
      expect(result.suggestions).toContain('Try using the image upload option');
      expect(result.canRetry).toBe(true);
    });
  });

  it('should handle security/HTTPS errors', () => {
    const errors = [
      { message: 'SecurityError' },
      { name: 'NotSupportedError' },
      'requires https',
      { message: 'security context required' },
    ];

    errors.forEach(error => {
      const result = mapCameraError(error);
      expect(result.message).toContain('secure connection');
      expect(result.suggestions).toContain("Make sure you're using HTTPS");
      expect(result.canRetry).toBe(false);
    });
  });

  it('should handle abort/stopped errors', () => {
    const errors = [
      { message: 'AbortError' },
      { name: 'OperationError' },
      'stream stopped',
      { message: 'abort signal received' },
    ];

    errors.forEach(error => {
      const result = mapCameraError(error);
      expect(result.message).toContain('Camera access was interrupted');
      expect(result.suggestions).toContain('Try scanning again');
      expect(result.canRetry).toBe(true);
    });
  });

  it('should handle generic/unknown errors', () => {
    const errors = [
      { message: 'Unknown error' },
      'Random error message',
      { someProperty: 'value' },
      null,
      undefined,
      123,
    ];

    errors.forEach(error => {
      const result = mapCameraError(error);
      expect(result.message).toContain('Unable to access camera');
      expect(result.suggestions).toContain('Try using the image upload option instead');
      expect(result.canRetry).toBe(true);
    });
  });

  it('should handle errors with no message property', () => {
    const result = mapCameraError({ someOtherProperty: 'value' });
    
    expect(result.message).toContain('Unable to access camera');
    expect(result.canRetry).toBe(true);
  });

  it('should handle string errors', () => {
    const result = mapCameraError('Permission denied for camera');
    
    expect(result.message).toContain('Camera access denied');
    expect(result.canRetry).toBe(true);
  });

  it('should handle errors with both message and name properties', () => {
    const error = {
      message: 'The user denied permission',
      name: 'NotAllowedError'
    };
    
    const result = mapCameraError(error);
    expect(result.message).toContain('Camera access denied');
  });

  it('should be case insensitive', () => {
    const errors = [
      'PERMISSION DENIED',
      'NotFoundError',
      'Security Error',
      'CONSTRAINT not satisfied',
    ];

    errors.forEach(error => {
      const result = mapCameraError(error);
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('canRetry');
    });
  });
});

describe('handleBarcodeDetectionError', () => {
  it('should handle camera context errors', () => {
    const result = handleBarcodeDetectionError('camera');
    
    expect(result.message).toContain('No barcode detected in camera view');
    expect(result.suggestions).toContain('Make sure the barcode is clearly visible');
    expect(result.suggestions).toContain('Move the camera closer to the barcode');
    expect(result.suggestions).toContain('Ensure good lighting conditions');
    expect(result.suggestions).toContain('Try holding the camera steady');
    expect(result.canRetry).toBe(true);
  });

  it('should handle upload context errors', () => {
    const result = handleBarcodeDetectionError('upload');
    
    expect(result.message).toContain('No barcode found in the uploaded image');
    expect(result.suggestions).toContain('Make sure the image contains a clear barcode');
    expect(result.suggestions).toContain('Try a higher resolution image');
    expect(result.suggestions).toContain("Ensure the barcode isn't blurry or damaged");
    expect(result.suggestions).toContain('Use the camera scanner for better results');
    expect(result.canRetry).toBe(true);
  });

  it('should return different messages for different contexts', () => {
    const cameraResult = handleBarcodeDetectionError('camera');
    const uploadResult = handleBarcodeDetectionError('upload');
    
    expect(cameraResult.message).not.toBe(uploadResult.message);
    expect(cameraResult.suggestions).not.toEqual(uploadResult.suggestions);
  });
});

describe('getBarcodeQualityTips', () => {
  it('should provide blurry image tips', () => {
    const tips = getBarcodeQualityTips('blurry');
    
    expect(tips).toContain('Hold the camera steady');
    expect(tips).toContain('Wait for the camera to focus');
    expect(tips).toContain('Move closer to the barcode');
    expect(tips).toContain('Clean the camera lens');
  });

  it('should provide lighting tips', () => {
    const tips = getBarcodeQualityTips('lighting');
    
    expect(tips).toContain('Ensure good lighting on the barcode');
    expect(tips).toContain('Avoid shadows on the barcode');
    expect(tips).toContain('Use the flashlight button if available');
    expect(tips).toContain('Avoid reflective surfaces');
  });

  it('should provide angle tips', () => {
    const tips = getBarcodeQualityTips('angle');
    
    expect(tips).toContain('Hold the camera parallel to the barcode');
    expect(tips).toContain('Center the barcode in the scanning area');
    expect(tips).toContain('Avoid tilting the camera');
    expect(tips).toContain('Keep the barcode flat if possible');
  });

  it('should provide distance tips', () => {
    const tips = getBarcodeQualityTips('distance');
    
    expect(tips).toContain('Move the camera closer to the barcode');
    expect(tips).toContain('Fill most of the scanning area with the barcode');
    expect(tips).toContain("Don't get too close - keep some margin");
    expect(tips).toContain('Try different distances for best focus');
  });

  it('should provide default tips for unknown issues', () => {
    // @ts-expect-error - testing runtime behavior
    const tips = getBarcodeQualityTips('unknown');
    
    expect(tips).toContain('Ensure the barcode is clear and undamaged');
    expect(tips).toContain('Use good lighting');
    expect(tips).toContain('Hold the camera steady');
    expect(tips).toContain('Keep the barcode centered');
  });

  it('should provide default tips for invalid input', () => {
    // @ts-expect-error - testing runtime behavior
    const tips = getBarcodeQualityTips(null);
    
    expect(tips.length).toBeGreaterThan(0);
    expect(tips).toContain('Ensure the barcode is clear and undamaged');
  });
});

describe('handleBookLookupError', () => {
  it('should handle network errors', () => {
    const errors = [
      'NetworkError: Failed to fetch',
      { message: 'network timeout' },
      'fetch failed',
      new Error('Network request failed'),
    ];

    errors.forEach(error => {
      const result = handleBookLookupError(error);
      expect(result.message).toContain('Network error while searching');
      expect(result.suggestions).toContain('Check your internet connection');
      expect(result.canRetry).toBe(true);
    });
  });

  it('should handle rate limit errors', () => {
    const errors = [
      'Rate limit exceeded',
      { message: 'quota exceeded' },
      'Too many requests',
      'API quota limit reached',
    ];

    errors.forEach(error => {
      const result = handleBookLookupError(error);
      expect(result.message).toContain('Too many requests');
      expect(result.suggestions).toContain('Wait a few seconds and try again');
      expect(result.canRetry).toBe(true);
    });
  });

  it('should handle not found errors', () => {
    const errors = [
      'Book not found',
      { message: '404 error' },
      'Resource not found',
      'No results found',
    ];

    errors.forEach(error => {
      const result = handleBookLookupError(error);
      expect(result.message).toContain('Book not found in the database');
      expect(result.suggestions).toContain('Try scanning a different barcode');
      expect(result.suggestions).toContain('Add the book manually with its details');
      expect(result.canRetry).toBe(false);
    });
  });

  it('should handle generic API errors', () => {
    const errors = [
      'Server error',
      { message: 'Internal server error' },
      'API unavailable',
      'Unknown API error',
    ];

    errors.forEach(error => {
      const result = handleBookLookupError(error);
      expect(result.message).toContain('Unable to look up the book details');
      expect(result.suggestions).toContain('Try scanning again');
      expect(result.suggestions).toContain('Check your internet connection');
      expect(result.canRetry).toBe(true);
    });
  });

  it('should handle various error formats', () => {
    const testCases = [
      'string error',
      { message: 'error object' },
      new Error('Error instance'),
      123,
      null,
      undefined,
    ];

    testCases.forEach(error => {
      const result = handleBookLookupError(error);
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('canRetry');
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(typeof result.canRetry).toBe('boolean');
    });
  });

  it('should be case insensitive for error matching', () => {
    const result1 = handleBookLookupError('NETWORK ERROR');
    const result2 = handleBookLookupError('Network Error');
    const result3 = handleBookLookupError('network error');
    
    expect(result1.message).toBe(result2.message);
    expect(result2.message).toBe(result3.message);
  });
});

describe('ScanningError interface', () => {
  it('should have proper structure for all error handlers', () => {
    const testCases = [
      mapCameraError('test error'),
      handleBarcodeDetectionError('camera'),
      handleBookLookupError('test error'),
    ];

    testCases.forEach((result: ScanningError) => {
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('canRetry');
      
      expect(typeof result.message).toBe('string');
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(typeof result.canRetry).toBe('boolean');
      
      expect(result.message.length).toBeGreaterThan(0);
      expect(result.suggestions.length).toBeGreaterThan(0);
      
      result.suggestions.forEach(suggestion => {
        expect(typeof suggestion).toBe('string');
        expect(suggestion.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('Integration tests', () => {
  it('should provide comprehensive error handling workflow', () => {
    // Simulate a camera error, then barcode detection error, then lookup error
    const cameraError = mapCameraError('Permission denied');
    expect(cameraError.canRetry).toBe(true);
    
    const detectionError = handleBarcodeDetectionError('camera');
    expect(detectionError.canRetry).toBe(true);
    
    const lookupError = handleBookLookupError('Network error');
    expect(lookupError.canRetry).toBe(true);
    
    // All should have helpful suggestions
    expect(cameraError.suggestions.length).toBeGreaterThan(0);
    expect(detectionError.suggestions.length).toBeGreaterThan(0);
    expect(lookupError.suggestions.length).toBeGreaterThan(0);
  });

  it('should provide different advice based on error type', () => {
    const permissionError = mapCameraError('Permission denied');
    const notFoundError = mapCameraError('No camera found');
    
    expect(permissionError.suggestions).not.toEqual(notFoundError.suggestions);
    expect(permissionError.canRetry).toBe(true);
    expect(notFoundError.canRetry).toBe(false);
  });

  it('should handle edge cases gracefully', () => {
    const edgeCases = [null, undefined, '', {}, [], 0, false];
    
    edgeCases.forEach(testCase => {
      expect(() => {
        mapCameraError(testCase);
        handleBookLookupError(testCase);
      }).not.toThrow();
    });
  });
});