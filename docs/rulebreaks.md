# Architectural Rule Violations

This document lists all violations of the architectural rules defined in [rules.md](./rules.md).

## Summary

**Total Violations Found: 7**

## Violations

### 1. Components Importing Firebase Directly
**File:** `src/components/app/__tests__/BookCard.test.tsx`  
**Line:** 6  
**Rule Broken:** Components cannot import Firebase modules directly (rule: Components → External Services FORBIDDEN).  
**Details:** Test component imports `Timestamp` from `firebase/firestore` instead of using mocked data or going through providers.

### 2. Components Importing Business Logic Utilities
**File:** `src/components/app/AddBooksPage.tsx`  
**Lines:** 34-35  
**Rule Broken:** Components should only call providers, not utility functions containing business logic.  
**Details:** Component directly imports `convertGoogleBookToBook` and `convertManualEntryToBook` which contain book creation business logic that should be in services.

### 3. Components Importing External API Libraries  
**File:** `src/components/app/AddBooksPage.tsx`  
**Lines:** 41-43  
**Rule Broken:** Components should not directly import external API libraries (rule: Components → External Services FORBIDDEN).  
**Details:** Component imports Google Books API utilities (`GoogleBooksVolume`, `getBestThumbnail`, `formatAuthors`) instead of accessing through service layer.

### 4. Business Logic in Utility Files (Should be in Services)
**File:** `src/lib/book-utils.ts`  
**Lines:** 22-45 (convertGoogleBookToBook function)  
**Rule Broken:** Business logic should be in services, not utility files.  
**Details:** Book creation logic with state initialization and field mapping should be in BookService, not a utility function.

### 5. Business Logic in Utility Files (Should be in Services)  
**File:** `src/lib/book-utils.ts`  
**Lines:** 70-95 (convertManualEntryToBook function)  
**Rule Broken:** Business logic should be in services, not utility files.  
**Details:** Manual book creation logic with validation and transformation should be in BookService, not a utility function.

### 6. Business Logic in Utility Files (Should be in Services)
**File:** `src/lib/book-utils.ts`  
**Lines:** 97-157 (filterAndSortBooks function)  
**Rule Broken:** Business logic should be in services, not utility files.  
**Details:** Book filtering and sorting logic should be in BookService or provided through BooksProvider, not as standalone utility.

### 7. Business Logic in Utility Files (Should be in Services)
**File:** `src/lib/book-utils.ts`  
**Lines:** 159-172 (calculateBookProgress function)  
**Rule Broken:** Business logic should be in services, not utility files.  
**Details:** Progress calculation business logic should be in BookService (already exists in BooksProvider but duplicated here).

## Recommended Fixes

### 1. Fix Test Firebase Import
- Replace `import { Timestamp } from 'firebase/firestore'` with mock data or factory functions
- Use test utilities instead of actual Firebase objects in tests

### 2. Move Book Utilities to BookService
- Move `convertGoogleBookToBook` to `BookService.createFromGoogleBook()`
- Move `convertManualEntryToBook` to `BookService.createFromFormData()`
- Move `filterAndSortBooks` logic into `BooksProvider.filterAndSortBooks()` 
- Remove duplicate `calculateBookProgress` (already exists in BooksProvider)

### 3. Update AddBooksPage Component
- Remove direct imports of book-utils and google-books-api
- Call book creation methods through `useBooksContext()` provider
- Let provider handle Google Books API integration through services

### 4. Update BooksProvider
- Add methods like `createBookFromGoogleBook()` and `createBookFromFormData()`
- These methods should call the new BookService methods internally
- Remove direct book-utils imports from components

## Architecture Compliance Checklist

- [ ] All components only import from `@/lib/providers`
- [ ] All business logic moved from utilities to services  
- [ ] All external API calls go through repository layer
- [ ] No Firebase imports in components or tests
- [ ] No utility files containing business logic

---

*Last Updated: January 8, 2025*  
*Total Rule Violations: 7*