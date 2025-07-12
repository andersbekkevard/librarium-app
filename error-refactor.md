# Error System Refactoring Specification

## **Executive Summary**

This document outlines the refactoring of Librarium's error handling system to unify two parallel error systems into a single, consistent, and maximally simple approach while preserving the excellent UI/UX error handling already built.

## **Current State Analysis**

### **Problems**
1. **Dual Error Systems**: Running both old `ServiceResult<T>` with string errors and new `StandardError` system
2. **Inconsistent Usage**: Services return string errors, but UI components expect `StandardError` objects
3. **Over-Engineering**: Too many error categories, complex error objects, unused features, bloated error handling
4. **Incomplete Integration**: New error system not fully adopted across the codebase

### **Existing Assets to Preserve**
- ✅ Error display components (`ErrorAlert`, `ErrorCard`, `ErrorToast`, etc.)
- ✅ Error boundaries and React error handling
- ✅ Error logging infrastructure
- ✅ Recovery actions and retry mechanisms
- ✅ Accessibility features in error UI

## **Target State: Unified Simple Error System**

### **Core Principles**
1. **Single Source of Truth**: One error type (`StandardError`) used everywhere
2. **Maximally Simple**: Only essential error categories and fields. Make it concise and minimal, yet functional and scaleable
3. **Consistent**: Same error handling pattern across all layers
4. **User-Focused**: Rich UI feedback with simple underlying implementation

### **Simplified Error Structure**

```typescript
// Simplified StandardError (keep existing structure but reduce complexity)
export interface StandardError {
  id: string;
  message: string;           // Technical message
  userMessage: string;       // User-friendly message
  category: ErrorCategory;   // Simplified categories
  severity: ErrorSeverity;   // Keep existing severity levels
  timestamp: Date;
  retryable: boolean;
  recoverable: boolean;
  context?: Record<string, any>;
  originalError?: Error;
}

// Simplified categories (reduce from 8 to 4)
export enum ErrorCategory {
  VALIDATION = "validation",   // Form validation, data validation
  NETWORK = "network",         // API calls, connectivity issues
  AUTHORIZATION = "authorization", // Auth failures, permissions
  SYSTEM = "system",           // Unexpected errors, crashes
}

// Keep existing severity levels (they're well-designed)
export enum ErrorSeverity {
  LOW = "low",      // Info-level, non-blocking
  MEDIUM = "medium", // Warning-level, may impact UX
  HIGH = "high",     // Error-level, blocks functionality
  CRITICAL = "critical", // System-level, app-breaking
}
```

### **Unified Service Result Type**

```typescript
interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: StandardError;  // Always StandardError, never string
}
```

## **Detailed Changes Required**

### **1. Simplify Error Handling Core (`src/lib/error-handling.ts`)**

**Changes:**
- Remove unused error categories and provider-specific types
- Simplify ErrorBuilder to focus on essential fields
- Remove complex logging features (breadcrumbs, performance monitoring)
- Keep essential error utilities

**Specific Actions:**
```typescript
// Remove these enums/interfaces:
- ProviderErrorType
- ErrorContext (keep but simplify)
- ErrorLogger interface (keep but simplify)
- EnhancedErrorLogger class complexity

// Keep these simplified:
- ErrorCategory (4 categories only)
- ErrorSeverity (unchanged)
- StandardError (simplified)
- ErrorBuilder (simplified)
- ErrorHandlerUtils (core methods only)
```

### **2. Simplify Error Logging (`src/lib/error-logging.ts`)**

**Changes:**
- Remove complex logging features (breadcrumbs, performance monitoring, remote logging)
- Keep simple console + localStorage logging
- Remove LogLevel complexity

**Specific Actions:**
```typescript
// Replace EnhancedErrorLogger with SimpleErrorLogger:
export class SimpleErrorLogger {
  logError(error: StandardError, context?: Record<string, any>): void;
  logWarning(message: string, context?: Record<string, any>): void;
  logInfo(message: string, context?: Record<string, any>): void;
  // Remove: breadcrumbs, performance monitoring, remote logging
}
```

### **3. Update Service Layer**

**Files to Update:**
- `src/lib/services/AuthService.ts`
- `src/lib/services/BookService.ts`
- `src/lib/services/UserService.ts`
- `src/lib/services/EventService.ts`

**Changes:**
- Remove `ServiceError` class (use `StandardError` directly)
- Update all service methods to return `StandardError` objects instead of strings
- Use `ErrorHandlerUtils` helper methods consistently
- Remove error transformation methods (use `ErrorBuilder` directly)

**Example Transformation:**
```typescript
// BEFORE:
private handleRepositoryError(error: string): ServiceError {
  if (error.includes("Access denied")) {
    return new ServiceError(
      ServiceErrorType.AUTHORIZATION_ERROR,
      "You don't have permission to access this book",
      error
    );
  }
  // ... more conditions
}

async getBook(userId: string, bookId: string): Promise<ServiceResult<Book | null>> {
  try {
    const result = await this.bookRepository.getBook(userId, bookId);
    if (!result.success) {
      const serviceError = this.handleRepositoryError(result.error!);
      return { success: false, error: serviceError.message }; // ❌ String
    }
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: "Failed to get book" }; // ❌ String
  }
}

// AFTER:
private handleRepositoryError(error: string): StandardError {
  if (error.includes("Access denied")) {
    return new ErrorBuilder("Repository access denied")
      .withCategory(ErrorCategory.AUTHORIZATION)
      .withUserMessage("You don't have permission to access this book")
      .withContext({ originalError: error })
      .build();
  }
  // Use ErrorBuilder for all cases
}

async getBook(userId: string, bookId: string): Promise<ServiceResult<Book | null>> {
  try {
    const result = await this.bookRepository.getBook(userId, bookId);
    if (!result.success) {
      const standardError = this.handleRepositoryError(result.error!);
      return { success: false, error: standardError }; // ✅ StandardError
    }
    return { success: true, data: result.data };
  } catch (error) {
    const standardError = new ErrorBuilder("Failed to get book")
      .withCategory(ErrorCategory.SYSTEM)
      .withOriginalError(error as Error)
      .build();
    return { success: false, error: standardError }; // ✅ StandardError
  }
}
```

### **4. Update Service Types (`src/lib/services/types.ts`)**

**Changes:**
- Remove `ServiceError` class
- Remove `ServiceErrorType` enum
- Update `ServiceResult<T>` to use `StandardError`
- Remove duplicate error handling types

### **5. Update Provider Layer**

**Files to Update:**
- `src/lib/providers/AuthProvider.tsx`
- `src/lib/providers/BooksProvider.tsx`
- `src/lib/providers/UserProvider.tsx`

**Changes:**
- Ensure providers expose `StandardError` objects to components
- Update error state management to use `StandardError`
- Remove any string-based error handling

### **6. Update Components (Minimal Changes)**

**Files to Update:**
- `src/components/app/EditBookSheet.tsx`
- Any other components that handle errors

**Changes:**
- Ensure components expect `StandardError` objects from providers
- Remove any string-based error handling
- Components should mostly work as-is since they're already designed for `StandardError`

## **Implementation Helpers**

### **Convenience Functions for Common Errors**
```typescript
// Add to error-handling.ts for easy service usage
export const createValidationError = (message: string, userMessage?: string) =>
  new ErrorBuilder(message)
    .withCategory(ErrorCategory.VALIDATION)
    .withUserMessage(userMessage || message)
    .withSeverity(ErrorSeverity.MEDIUM)
    .build();

export const createNetworkError = (message: string, userMessage?: string) =>
  new ErrorBuilder(message)
    .withCategory(ErrorCategory.NETWORK)
    .withUserMessage(userMessage || "Please check your connection and try again")
    .withSeverity(ErrorSeverity.MEDIUM)
    .retryable()
    .build();

export const createAuthError = (message: string, userMessage?: string) =>
  new ErrorBuilder(message)
    .withCategory(ErrorCategory.AUTHORIZATION)
    .withUserMessage(userMessage || "Authentication failed")
    .withSeverity(ErrorSeverity.HIGH)
    .build();

export const createSystemError = (message: string, originalError?: Error) =>
  new ErrorBuilder(message)
    .withCategory(ErrorCategory.SYSTEM)
    .withUserMessage("An unexpected error occurred")
    .withSeverity(ErrorSeverity.HIGH)
    .withOriginalError(originalError)
    .build();
```

## **Success Metrics**

### **Code Quality**
- [ ] Single error type (`StandardError`) used consistently across all layers
- [ ] No string-based error handling remaining
- [ ] Reduced error handling code complexity by ~50%
- [ ] All services return `ServiceResult<T>` with `StandardError`

### **Developer Experience**
- [ ] Consistent error handling patterns across all services
- [ ] Easy-to-use convenience functions for common error types
- [ ] Clear error categorization and severity levels
- [ ] Rich error debugging information preserved

### **User Experience**
- [ ] All existing error UI components continue to work
- [ ] Consistent error messaging across the app
- [ ] Proper error recovery actions and retry mechanisms
- [ ] Accessible error feedback maintained

## **Files to Create/Modify**

### **New Files**
- This specification document

### **Modified Files**
- `src/lib/error-handling.ts` - Simplify and consolidate
- `src/lib/error-logging.ts` - Simplify logging
- `src/lib/services/types.ts` - Update ServiceResult type
- `src/lib/services/AuthService.ts` - Use StandardError
- `src/lib/services/BookService.ts` - Use StandardError
- `src/lib/services/UserService.ts` - Use StandardError
- `src/lib/services/EventService.ts` - Use StandardError
- `src/lib/providers/*.tsx` - Update error state management
- Components that handle errors - Minimal updates

### **Files to Delete**
- None (refactor existing files)

## **Post-Refactor Benefits**

1. **Consistency**: Single error handling pattern across entire app
2. **Simplicity**: Reduced complexity while keeping excellent UI/UX
3. **Maintainability**: Easier to understand and modify error handling
4. **Developer Experience**: Clear patterns for handling errors
5. **User Experience**: Rich error feedback with recovery options
6. **Type Safety**: Full TypeScript support for error handling

This refactoring maintains all the excellent error handling UI/UX while creating a unified, simple, and maintainable error system underneath. 