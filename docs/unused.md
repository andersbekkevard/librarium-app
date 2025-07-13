# Unused Code Elements Report

This document highlights unused or legacy code found outside the `ui` directory. Removing or refactoring these elements can reduce maintenance overhead and improve overall code clarity.

---

## Configuration

- **`LAYOUT_CONFIG` and `APP_CONFIG`**
  - Defined but never imported outside their own file or its test files.

---

## Utilities

- **`getCSSVariable`**
  - Exported from `colors.ts`, used only within test files.

---

## Error Handling

- **`safeAsyncOperation` and `safeSyncOperation`**
  - Defined in `error-handling.ts`, referenced only in tests.

---

## Type Guards & Models

- **`isValidEventType`**
  - Declared in `models.ts`, used exclusively in tests.

- **`BookProgressUpdate` and `BookStateTransition`**
  - Type definitions declared but never used in the application code.

---

## AuthService Methods

Tested but unused convenience getters:
- `getUserDisplayName`
- `getUserEmail`
- `getUserPhotoURL`
- `getUserId`
- `isEmailVerified`

---

## BookService

- **`importBooks()`**
  - Implemented but never invoked in any other module.

---

## EventService

- **`getBookEvents()`**
  - Present but unused outside test coverage.

---

## Logging Utilities

- **Unused methods in `error-logging.ts`**
  - `getStoredLogs`
  - `clearStoredLogs`
  - `exportLogs`

---