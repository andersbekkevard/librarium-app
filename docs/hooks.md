# Hooks Documentation

This document provides comprehensive documentation for all custom hooks used in the Librarium application.

## Table of Contents

1. [useBookSearch](#usebooksearch)
2. [useAuthContext](#useauthcontext)
3. [useUserContext](#useusercontext)
4. [useBooksContext](#usebookscontext)

---

## useBookSearch

### Name
`useBookSearch`

### How it works
A custom hook that provides functionality for searching books using the Google Books API. It manages the search state including results, loading status, and error handling.

**Features:**
- Performs asynchronous book searches with the Google Books API
- Manages loading state during searches
- Handles search errors with user-friendly error messages
- Provides functions to clear results and errors
- Validates input queries (ignores empty queries)
- Uses `useCallback` for performance optimization

**State managed:**
- `searchResults`: Array of Google Books volumes returned from search
- `isSearching`: Boolean indicating if a search is in progress
- `error`: String containing error message if search fails

**Functions provided:**
- `search(query, maxResults?)`: Performs book search
- `clearResults()`: Clears search results and errors
- `clearError()`: Clears only the error state

### Where it is made
📁 **Location:** `src/lib/hooks/useBookSearch.ts`

### Where it is used
📁 **Usage locations:**
- `src/components/app/AddBooksPage.tsx` - Used for searching and adding new books to the library

**Usage example:**
```typescript
const { searchResults, isSearching, error, search, clearResults } = useBookSearch();

// Perform search
await search("javascript programming", 10);

// Clear results
clearResults();
```

---

## useAuthContext

### Name
`useAuthContext`

### How it works
A React context hook that provides access to authentication state and operations. It manages Firebase authentication using the AuthService and provides a simplified interface for authentication-related operations.

**Features:**
- Manages Firebase user authentication state
- Provides Google sign-in functionality
- Handles sign-out operations
- Tracks loading states during auth operations
- Centralizes authentication error handling
- Sets up real-time authentication state listeners

**State managed:**
- `user`: Firebase User object or null
- `loading`: Boolean indicating if auth state is loading
- `isAuthenticated`: Convenience boolean for auth status
- `error`: String containing auth-related error messages

**Functions provided:**
- `signInWithGoogle()`: Initiates Google OAuth sign-in
- `signOut()`: Signs out the current user

### Where it is made
📁 **Location:** `src/lib/providers/AuthProvider.tsx`

### Where it is used
📁 **Usage locations:**
- `src/lib/providers/UserProvider.tsx` - Accesses user for profile management
- `src/lib/providers/BooksProvider.tsx` - Accesses user for book operations
- `src/components/app/MyLibraryPage.tsx` - Gets current user for book operations
- `src/components/app/AddBooksPage.tsx` - Gets current user for adding books
- `src/components/app/UserProfileDropdown.tsx` - User info and sign-out functionality
- `src/components/app/BookDetailPage.tsx` - User authentication checks
- `src/components/app/Header.tsx` - Loading state for header display
- `src/app/(landing)/page.tsx` - Redirect authenticated users to dashboard
- `src/app/(app)/dashboard/page.tsx` - Auth protection and user info
- `src/app/(app)/books/[id]/page.tsx` - Auth protection for book details
- `src/components/landing/sections/hero.tsx` - Sign-in functionality

**Usage example:**
```typescript
const { user, isAuthenticated, loading, signInWithGoogle, signOut } = useAuthContext();

// Check authentication
if (!isAuthenticated) {
  await signInWithGoogle();
}

// Sign out
await signOut();
```

---

## useUserContext

### Name
`useUserContext`

### How it works
A React context hook that manages user profile data and statistics. It handles user profile CRUD operations and maintains user statistics through the UserService. Works in conjunction with the AuthProvider to provide complete user management.

**Features:**
- Manages user profile state and operations
- Tracks user reading statistics
- Provides profile update functionality
- Handles real-time profile synchronization
- Initializes user profiles for new Firebase users
- Manages loading states and error handling for user operations

**State managed:**
- `userProfile`: UserProfile object or null
- `userStats`: UserStats object containing reading statistics
- `loading`: Boolean indicating if user data is loading
- `error`: String containing user-related error messages

**Functions provided:**
- `updateUserProfile(updates)`: Updates user profile information
- `refreshUserProfile()`: Manually refreshes profile from server
- `refreshUserStats()`: Refreshes user reading statistics
- `updateUserStats()`: Recalculates and updates user statistics

### Where it is made
📁 **Location:** `src/lib/providers/UserProvider.tsx`

### Where it is used
📁 **Usage locations:**
- `src/lib/providers/BooksProvider.tsx` - Updates user stats when books change
- `src/components/app/UserProfileDropdown.tsx` - Displays user profile information

**Usage example:**
```typescript
const { userProfile, userStats, updateUserProfile, updateUserStats } = useUserContext();

// Update profile
await updateUserProfile({ displayName: "New Name" });

// Refresh statistics
await updateUserStats();
```

---

## useBooksContext

### Name
`useBooksContext`

### How it works
A React context hook that manages the user's book collection state and operations. It provides a comprehensive interface for book management including CRUD operations, filtering, sorting, and progress tracking. Uses the BookService for all business logic and maintains real-time synchronization with the database.

**Features:**
- Manages complete book collection state
- Provides CRUD operations for books
- Handles book progress tracking and state updates
- Supports filtering and sorting of books
- Calculates reading progress and statistics
- Maintains real-time book synchronization
- Integrates with user statistics updates

**State managed:**
- `books`: Array of user's Book objects
- `loading`: Boolean indicating if books are loading
- `error`: String containing book-related error messages
- Computed statistics: `totalBooks`, `booksInProgress`, `booksFinished`, `booksNotStarted`

**Functions provided:**
- `addBook(book)`: Adds a new book to the collection
- `updateBook(bookId, updates)`: Updates an existing book
- `updateBookProgress(bookId, currentPage)`: Updates reading progress
- `updateBookState(bookId, newState)`: Changes book reading state
- `updateBookRating(bookId, rating)`: Updates book rating
- `deleteBook(bookId)`: Removes book from collection
- `refreshBooks()`: Manually refreshes book collection
- `getBook(bookId)`: Retrieves a single book by ID
- `filterAndSortBooks()`: Filters and sorts books based on criteria
- `calculateBookProgress(book)`: Calculates reading progress percentage

### Where it is made
📁 **Location:** `src/lib/providers/BooksProvider.tsx`

### Where it is used
📁 **Usage locations:**
- `src/components/app/BookCard.tsx` - Calculates book progress for display
- `src/components/app/MyLibraryPage.tsx` - Complete book management interface
- `src/components/app/BookDetailPage.tsx` - Book updates and progress tracking
- `src/components/app/AddBooksPage.tsx` - Adding new books to collection
- `src/app/(app)/dashboard/page.tsx` - Book statistics for dashboard
- `src/app/(app)/books/[id]/page.tsx` - Individual book data access

**Usage example:**
```typescript
const { 
  books, 
  loading, 
  addBook, 
  updateBookProgress, 
  filterAndSortBooks,
  totalBooks 
} = useBooksContext();

// Add a new book
const bookId = await addBook({
  title: "New Book",
  author: "Author Name",
  // ... other book properties
});

// Update reading progress
await updateBookProgress(bookId, 150);

// Filter books
const filteredBooks = filterAndSortBooks(
  "search query",
  "in_progress",
  "owned",
  "title",
  "asc"
);
```

---

## Hook Dependencies

### Provider Hierarchy
The context hooks must be used within their respective provider components:

```
AppProviders
├── AuthProvider (provides useAuthContext)
├── UserProvider (provides useUserContext, uses useAuthContext)
└── BooksProvider (provides useBooksContext, uses useAuthContext + useUserContext)
```

### Error Handling
All context hooks throw errors if used outside their provider context:
- `useAuthContext must be used within an AuthProvider`
- `useUserContext must be used within a UserProvider`
- `useBooksContext must be used within a BooksProvider`

### Performance Considerations
- `useBookSearch` uses `useCallback` for optimized re-renders
- Context hooks use real-time listeners for automatic state updates
- Book filtering/sorting is memoized in components using `useMemo` 