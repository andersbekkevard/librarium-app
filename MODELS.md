# MVP Data Models for Librarium

This document defines the minimum viable product (MVP) data structures for the Librarium book tracking app. These models support the core features: adding books, tracking reading progress, and rating books.

## Core Data Models

### UserProfile

The `UserProfile` represents basic user information and preferences stored in Firestore. Since the app uses Google OAuth exclusively, user data is populated from Google account information.

```typescript
interface UserProfile {
  id: string;                    // Firebase Auth UID
  displayName: string;           // User's display name from Google
  email: string;                 // User's email address from Google
  photoURL?: string;             // Profile picture URL from Google
  createdAt: Timestamp;          // Account creation timestamp
  updatedAt: Timestamp;          // Last profile update timestamp
  
  // Google Auth metadata
  emailVerified: boolean;        // Email verification status from Google
  lastSignInTime: string;        // Last sign-in timestamp from Firebase Auth
  
  // MVP-specific fields
  totalBooksRead: number;        // Count of finished books
  currentlyReading: number;      // Count of books in progress
  booksInLibrary: number;        // Total books in collection
}
```

**Firestore Path**: `users/{userId}/profile/main`

### Book

The `Book` represents a book in the user's personal library with reading state tracking.

```typescript
interface Book {
  id: string;                    // Unique book identifier
  title: string;                 // Book title
  author: string;                // Primary author
  
  // Reading state management
  state: 'not_started' | 'in_progress' | 'finished';
  progress: {
    currentPage: number;         // Current reading position
    totalPages?: number;         // Total pages (if known)
    percentage?: number;         // Reading percentage (0-100)
  };
  
  // Ownership and rating
  isOwned: boolean;              // true = owned, false = wishlist
  rating?: number;               // User rating (1-5 stars)
  
  // Metadata (populated from Google Books API or user input)
  isbn?: string;                 // ISBN identifier
  coverImage?: string;           // Cover image URL
  publishedDate?: string;        // Publication date
  description?: string;          // Book description
  
  // Timestamps
  addedAt: Timestamp;            // When book was added to library
  updatedAt: Timestamp;          // Last update timestamp
  startedAt?: Timestamp;         // When user started reading
  finishedAt?: Timestamp;        // When user finished reading
}
```

**Firestore Path**: `users/{userId}/books/{bookId}`

### BookEvent

The `BookEvent` logs reading activities and state changes for future timeline features.

```typescript
interface BookEvent {
  id: string;                    // Unique event identifier
  bookId: string;                // Reference to the book
  userId: string;                // Reference to the user
  
  // Event details
  type: 'state_change' | 'progress_update' | 'rating_added' | 'note_added';
  timestamp: Timestamp;          // When the event occurred
  
  // Event-specific data
  data: {
    // For state_change events
    previousState?: Book['state'];
    newState?: Book['state'];
    
    // For progress_update events
    previousPage?: number;
    newPage?: number;
    
    // For rating_added events
    rating?: number;
    
    // For note_added events (future expansion)
    note?: string;
  };
}
```

**Firestore Path**: `users/{userId}/events/{eventId}`

## Firebase Collection Structure

The app uses a user-centric document structure for optimal security and performance:

```
users/{userId}/
├── profile/
│   └── main                   # UserProfile document
├── books/{bookId}/            # Book collection
│   ├── book1                  # Individual Book documents
│   ├── book2
│   └── ...
└── events/{eventId}/          # BookEvent collection
    ├── event1                 # Individual BookEvent documents
    ├── event2
    └── ...
```

## MVP Implementation Guidelines

### Reading State Machine

Books follow a strict state progression:
- `not_started` → `in_progress` → `finished`
- State changes are logged as BookEvents
- Progress tracking is only active for `in_progress` books

### Core MVP Features

1. **Add Books**: Create Book documents with `not_started` state
2. **Track Progress**: Update `progress.currentPage` and calculate percentage
3. **Rate Books**: Add rating (1-5 stars) to finished books

### Data Validation Rules

- All required fields must be present
- Reading state can only progress forward
- Progress percentage must be 0-100
- Rating must be 1-5 if provided
- Timestamps are managed by Firebase

### Security Rules

Firestore security rules ensure users can only access their own data:
- Read/write access limited to authenticated users
- Documents scoped to user ID
- No cross-user data access

## Implementation Notes

### Firebase Integration

- Use Firebase Timestamps for all date fields
- Implement real-time listeners for book collection
- Use Firestore transactions for state changes
- Batch writes for multiple updates

### Future Expansion

This MVP structure supports future features:
- Book sharing and collaboration
- Reading goals and statistics
- Social features and recommendations
- Advanced search and filtering
- Reading history and analytics

The simple MVP structure provides a solid foundation that can be extended without breaking changes to the core data models.