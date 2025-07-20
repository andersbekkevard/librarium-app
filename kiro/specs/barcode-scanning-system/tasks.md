# Implementation Plan

## Overview

This implementation plan creates a streamlined barcode scanning system that leverages react-zxing's built-in capabilities while following the established service layer architecture. The plan focuses on minimal, efficient code that integrates seamlessly with the existing AddBooksPage by eliminating redundant layers and using the library's native features.

## Implementation Tasks

- [ ] 1. Install and configure react-zxing dependency
  - Add react-zxing and @zxing/library to package.json dependencies
  - Verify compatibility with existing Next.js and React 19 setup
  - Test basic useZxing hook functionality with simple component
  - _Requirements: 1.1, 1.2_

- [ ] 2. Create ISBN utility functions
  - Create `src/lib/utils/isbn-utils.ts` with pure functions
  - Implement `extractISBN(barcodeText: string): string | null` for ISBN extraction from various barcode formats
  - Implement `validateISBN(isbn: string): boolean` with checksum validation for ISBN-10 and ISBN-13
  - Add comprehensive unit tests for all ISBN utility functions
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 3. Create error mapping utilities
  - Create `src/lib/utils/scanning-errors.ts` utility
  - Implement `mapCameraError(error: Error): string` to map camera errors to user-friendly messages
  - Add `handleScanningError(error: unknown, context: string): string` for contextual error handling
  - Test error mapping with various error scenarios
  - _Requirements: 4.5, 6.3, 6.4_

- [ ] 4. Enhance BookService with ISBN method
  - Add `addBookFromISBN(userId: string, isbn: string): Promise<ServiceResult<string>>` method to existing BookService
  - Integrate with existing Google Books API searchByISBN method
  - Use existing convertGoogleBookToBook utility for data transformation
  - Add unit tests for new BookService method
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 5. Create ScanningOverlay component
  - Create `src/components/app/books/ScanningOverlay.tsx` as pure visual component
  - Design minimal scanning frame with corner indicators using shadcn/ui styling
  - Add proper ARIA labels for accessibility
  - Ensure pointer-events-none to avoid interfering with camera
  - _Requirements: 3.2, 4.2, 4.3_

- [ ] 6. Implement CameraScanner component
  - Create `src/components/app/books/CameraScanner.tsx` component
  - Use useZxing hook with minimal configuration (environment camera, paused prop)
  - Add ScanningOverlay as absolute positioned overlay
  - Implement torch control using torch object from useZxing
  - Handle all errors through useZxing's onError callback
  - _Requirements: 1.1, 1.2, 1.3, 6.1, 6.2_

- [ ] 7. Implement ImageUploader component
  - Create `src/components/app/books/ImageUploader.tsx` component
  - Use BrowserMultiFormatReader.decodeFromImageElement() directly
  - Implement file input with proper validation (size, type)
  - Add image preview with processing indicators
  - Handle file cleanup with URL.revokeObjectURL
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 8. Create main BarcodeScanner component
  - Create `src/components/app/books/BarcodeScanner.tsx` component
  - Implement minimal state (mode, status, foundBook, error)
  - Add mode toggle between camera and upload
  - Integrate CameraScanner and ImageUploader components
  - Handle barcode detection with ISBN extraction and Google Books API search
  - _Requirements: 3.1, 3.2, 3.3, 4.1_

- [ ] 9. Reuse existing BookPreviewCard component
  - Verify existing BookPreviewCard works with GoogleBooksVolume data
  - Update component if needed to handle scanned book preview
  - Ensure consistent styling with existing book cards
  - Add proper loading states for "Add to Library" action
  - _Requirements: 1.4, 1.5, 7.1_

- [ ] 10. Integrate BarcodeScanner into AddBooksPage
  - Update `src/components/app/AddBooksPage.tsx` to include scan tab
  - Replace placeholder scan tab content with BarcodeScanner component
  - Connect to existing handleAddGoogleBook function
  - Ensure URL parameter support for tab switching works
  - Update recently added books display for scanned books
  - _Requirements: 7.1, 7.2, 7.4, 7.5_

- [ ] 11. Add accessibility features
  - Add proper ARIA labels and roles for all interactive elements
  - Implement screen reader announcements for scanning progress using aria-live
  - Ensure keyboard navigation works throughout the interface
  - Add focus management for error states and success states
  - Test with screen readers and keyboard-only navigation
  - _Requirements: 3.3, 4.2, 6.1_

- [ ] 12. Implement responsive design and mobile optimization
  - Test camera interface on mobile devices with different screen sizes
  - Optimize touch interactions for mobile scanning
  - Ensure proper viewport handling for camera preview
  - Test with different mobile browsers (Safari, Chrome, Firefox)
  - Add mobile-specific UI improvements if needed
  - _Requirements: 3.5, 1.1, 1.2_

- [ ] 13. Create comprehensive test suite
  - Write unit tests for ISBN utility functions with various barcode formats
  - Create component tests for BarcodeScanner with mocked useZxing hook
  - Mock BrowserMultiFormatReader for image upload testing
  - Test error handling scenarios with mocked failures
  - Add integration tests for complete scanning flow
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 14. Add performance optimizations
  - Implement automatic pause after successful scan using paused prop
  - Add file size validation for image uploads (10MB limit)
  - Ensure proper cleanup of camera resources through useZxing
  - Add timeout for URL cleanup in image processing
  - Test memory usage and resource cleanup
  - _Requirements: 6.5, 6.6_

- [ ] 15. Test barcode format support
  - Test with real ISBN-10, ISBN-13, and EAN-13 barcodes
  - Validate UPC-A codes that contain ISBNs
  - Test edge cases with damaged or partial barcodes
  - Verify fallback behavior for unrecognized barcode types
  - Document supported barcode formats
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 16. Integrate with existing event logging system
  - Log barcode scanning events through existing EventService
  - Add scanning source metadata to book addition events
  - Ensure scanning events appear in user activity history
  - Track scanning success/failure rates for analytics
  - Maintain consistency with other book addition methods
  - _Requirements: 7.2, 7.3, 7.6_

- [ ] 17. Final testing and polish
  - Conduct end-to-end testing across different devices and browsers
  - Test camera permissions flow on various platforms
  - Validate barcode scanning accuracy with real books
  - Ensure consistent UI/UX with rest of application using shadcn/ui components
  - Performance testing for camera initialization and processing
  - _Requirements: 1.6, 2.6, 3.6, 4.6, 5.6, 6.6_

## Technical Implementation Notes

### Key Dependencies
- `react-zxing`: Primary barcode scanning library with built-in camera management
- `@zxing/library`: Core barcode detection engine (peer dependency)
- Existing Google Books API integration
- Existing service layer architecture

### Architecture Decisions
1. **Leverage react-zxing**: Use built-in camera management, permission handling, and barcode detection
2. **Pure Functions**: ISBN processing as utility functions rather than service classes
3. **Minimal State**: Use only essential state (mode, status, foundBook, error)
4. **Consistent Integration**: Follow existing patterns for book addition and error handling
5. **Progressive Enhancement**: Graceful fallback when camera is unavailable

### Performance Considerations
- Automatic pause after successful barcode detection using `paused` prop
- Proper cleanup of camera resources through useZxing's internal management
- File size limits for image uploads (10MB)
- Immediate URL cleanup for temporary image previews

### Security and Privacy
- No video recording or image storage (handled by react-zxing)
- Local-only image processing using BrowserMultiFormatReader
- Proper camera resource cleanup through useZxing
- Clear permission request messaging

### Testing Strategy
- Mock useZxing hook for unit tests
- Component testing with React Testing Library
- Integration testing with mocked Google Books API
- End-to-end testing across devices and browsers