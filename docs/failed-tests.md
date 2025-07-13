# Failed Tests Analysis

This document lists test failures that are due to codebase issues where the actual implementation behavior differs from what the tests expect.

## Test Implementation Issues Fixed

The following test failures were due to incorrect test setup and have been resolved:

1. **BookCard.test.tsx** - Fixed Timestamp constructor mock issue
2. **firebase-mock.ts** - Created missing firebase mock utilities
3. **useBookSearch.test.ts** - Test isolation issues (some tests pass individually but fail in suite)

## Codebase Issues (Tests vs Implementation Mismatch)

### UserService.test.ts

#### 1. "should handle missing Firebase user properties"
- **Expected**: Test expects success when Firebase user has missing properties
- **Actual**: Test fails because code behavior differs from expectation
- **Issue**: The test expects the service to handle missing `displayName` and `email` gracefully, but the validation logic may be stricter than expected
- **Code Location**: `src/lib/services/UserService.ts` - `createProfileFromFirebaseUser` method
- **Analysis**: The code sets `displayName: firebaseUser.displayName || "Anonymous User"` and `email: firebaseUser.email || ""`, so missing properties should be handled. This suggests the validation logic may have an issue.

#### 2. "should handle validation errors"
- **Expected**: Test expects failure when `displayName` is empty string
- **Actual**: Test passes (succeeds) when it should fail
- **Issue**: The code transforms empty displayName to "Anonymous User" before validation, so it never sees the empty string
- **Code Location**: `src/lib/services/UserService.ts` - `createProfileFromFirebaseUser` method
- **Analysis**: The test expects validation to catch empty `displayName`, but the code normalizes it to "Anonymous User" first, making the validation never trigger.

#### 3. "should handle unexpected errors"
- **Expected**: Test expects error message "Failed to create user profile"
- **Actual**: Test gets error message "Database error: Database error"
- **Issue**: The error handling wraps repository errors differently than expected
- **Code Location**: `src/lib/services/UserService.ts` - `handleRepositoryError` method
- **Analysis**: When `getProfile` throws an error, it gets caught and processed through `handleRepositoryError`, which formats it as "Database error: {error}" instead of the generic fallback message.

### BookService.test.ts

#### 1. "should use provided current state"
- **Expected**: Test expects `mockBookRepository.getBook` not to be called when `currentState` is provided
- **Actual**: Test fails because `getBook` is still called
- **Issue**: The method calls `getBook` even when `currentState` is provided, because it needs book data for progress calculation when finishing
- **Code Location**: `src/lib/services/BookService.ts` - `updateBookState` method
- **Analysis**: The test assumes providing `currentState` should skip the `getBook` call entirely, but the implementation needs the full book data for state-specific logic (like setting progress to 100% when finishing). This is reasonable implementation behavior.

## Recommendations

### For UserService Issues:
1. **Issue #1 & #2**: The validation logic and data normalization should be reviewed. Either:
   - The tests should be updated to match the current normalization behavior, OR
   - The code should be changed to validate before normalizing

2. **Issue #3**: The error handling should be consistent. Either:
   - Update the test to expect the formatted error message, OR
   - Change the error handling to return the generic message for unexpected errors

### For BookService Issues:
1. **Issue #1**: The test expectation should be updated. The current implementation correctly needs book data for state-specific operations, so calling `getBook` is appropriate even when `currentState` is provided.