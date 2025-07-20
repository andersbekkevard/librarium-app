# Data Models for Librarium

This document defines the comprehensive data structures for the Librarium book tracking application. These models support a full-featured book management system with reading progress tracking, comments, reviews, activity history, and advanced analytics.

## Core Data Models

### UserProfile

The `UserProfile` represents basic user information and preferences stored in Firestore. Since the app uses Google OAuth exclusively, user data is populated from Google account information.

```typescript
interface UserProfile {
  id: string; // Firebase Auth UID
  displayName: string; // User's display name from Google
  email: string; // User's email address from Google
  photoURL?: string; // Profile picture URL from Google
  createdAt: Timestamp; // Account creation timestamp
  updatedAt: Timestamp; // Last profile update timestamp

  // Google Auth metadata
  emailVerified: boolean; // Email verification status from Google
  lastSignInTime: string; // Last sign-in timestamp from Firebase Auth

  // MVP-specific fields
  totalBooksRead: number; // Count of finished books
  currentlyReading: number; // Count of books in progress
  booksInLibrary: number; // Total books in collection
}
```

**Firestore Path**: `users/{userId}/profile/main`

### Book

The `Book` represents a book in the user's personal library with reading state tracking.

```typescript
interface Book {
  id: string; // Unique book identifier
  title: string; // Book title
  author: string; // Primary author

  // Reading state management
  state: "not_started" | "in_progress" | "finished";
  progress: {
    currentPage: number; // Current reading position
    totalPages: number; // Total pages
  };

  // Ownership and rating
  isOwned: boolean; // true = owned, false = wishlist
  rating?: number; // User rating (1-5 stars)

  // Metadata (populated from Google Books API or user input)
  isbn?: string; // ISBN identifier
  coverImage?: string; // Cover image URL
  genre?: string; // Genre of the book
  publishedDate?: string; // Publication date
  description?: string; // Book description

  // Timestamps
  addedAt: Timestamp; // When book was added to library
  updatedAt: Timestamp; // Last update timestamp
  startedAt?: Timestamp; // When user started reading
  finishedAt?: Timestamp; // When user finished reading
}
```

**Firestore Path**: `users/{userId}/books/{bookId}`

### BookEvent

The `BookEvent` logs all reading activities, state changes, and user interactions for comprehensive activity tracking and analytics.

```typescript
interface BookEvent {
  id: string; // Unique event identifier
  bookId: string; // Reference to the book
  userId: string; // Reference to the user

  // Event details
  type: "state_change" | "progress_update" | "rating_added" | "comment" | "review" | "manual_update";
  timestamp: Timestamp; // When the event occurred

  // Event-specific data
  data: {
    // For state_change events
    previousState?: Book["state"];
    newState?: Book["state"];

    // For progress_update events
    previousPage?: number;
    newPage?: number;

    // For rating_added events
    rating?: number;

    // For comment events
    comment?: string;
    commentState?: ReadingState;
    commentPage?: number;

    // For review events
    review?: string;
    reviewCreatedAt?: Timestamp;
    reviewUpdatedAt?: Timestamp;
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

## Advanced Data Models

### Type Aliases

Common type aliases used throughout the application:

```typescript
type ReadingState = Book["state"];
type EventType = BookEvent["type"];
```

### ActivityItem

UI-friendly transformation of BookEvent for dashboard and activity history display.

```typescript
interface ActivityItem {
  id: string; // Event ID
  type:
    | "finished"
    | "started"
    | "rated"
    | "added"
    | "progress"
    | "commented"
    | "manually_updated";
  bookTitle: string; // Book title for display
  bookId: string; // Reference to the book
  details?: string; // Additional details (e.g., "5 stars", "20 pages")
  timestamp: Date; // When the activity occurred
  colorClass: string; // Tailwind class for visual indicator
}
```

### BookComment

UI-friendly representation of comment events for display components.

```typescript
interface BookComment {
  id: string; // Event ID
  bookId: string; // Reference to the book
  userId: string; // Reference to the user
  text: string; // Comment text content
  readingState: ReadingState; // Reading state when comment was made
  currentPage: number; // Page number when comment was made
  timestamp: Timestamp; // When the comment was created
}
```

### BookReview

UI-friendly representation of review events for display components.

```typescript
interface BookReview {
  id: string; // Event ID
  bookId: string; // Reference to the book
  userId: string; // Reference to the user
  text: string; // Review text content
  createdAt: Timestamp; // When the review was created
  updatedAt: Timestamp; // When the review was last updated
}
```

### Genre Color Mapping

System for consistent genre visualization across the application.

```typescript
interface GenreColorMapping {
  [genre: string]: {
    bg: string;
    text: string;
    border: string;
    hue: number; // For chart colors
  };
}
```

## Implementation Guidelines

### Reading State Machine

Books follow a flexible state progression with manual override capability:

- **Standard Flow**: `not_started` → `in_progress` → `finished`
- **Manual Updates**: Allow bypass of state machine for data corrections
- **State Validation**: `canTransitionTo()` function validates allowed transitions
- **Automatic Triggers**: Progress updates automatically trigger state changes

### Advanced Features

1. **Comment System**: Contextual comments with page numbers and reading state
2. **Review System**: Comprehensive book reviews with ratings and timestamps  
3. **Activity Tracking**: All user interactions logged for analytics
4. **Manual Updates**: Administrative corrections with audit trails
5. **Real-time Synchronization**: Live updates across all connected clients

### Data Validation Rules

#### Book Validation
- All required fields (title, author, state) must be present
- Progress percentage must be 0-100
- Rating must be 1-5 if provided
- Page numbers must be non-negative
- Total pages must be greater than 0

#### Comment Validation
```typescript
function validateComment(comment: string): boolean {
  if (typeof comment !== "string") {
    return false;
  }
  const trimmed = comment.trim();
  return trimmed.length >= 1 && trimmed.length <= 2000;
}

function validateCommentPage(page: number, totalPages: number): boolean {
  if (typeof page !== "number" || isNaN(page)) {
    return false;
  }
  if (typeof totalPages !== "number" || isNaN(totalPages)) {
    return false;
  }
  return page >= 0 && page <= totalPages;
}
```

#### Review Validation
```typescript
function validateReview(review: string): boolean {
  if (typeof review !== "string") {
    return false;
  }
  const trimmed = review.trim();
  return trimmed.length >= 10 && trimmed.length <= 5000;
}
```

### Event Type Definitions

- **state_change**: Reading state transitions (started, finished)
- **progress_update**: Page progress updates with percentage calculation
- **rating_added**: Book rating assignments and updates
- **comment**: Contextual reading comments with page/state context
- **review**: Comprehensive book reviews with detailed feedback
- **manual_update**: Administrative corrections bypassing validation

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

### Service Result Types

Standardized result objects for consistent error handling across services.

```typescript
interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface RepositoryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## Type Guards and Utilities

### Runtime Type Validation

```typescript
// Reading state validation
function isValidReadingState(state: string): state is Book["state"] {
  return ["not_started", "in_progress", "finished"].includes(state);
}

// Event type validation
function isValidEventType(type: string): type is BookEvent["type"] {
  return ["state_change", "progress_update", "rating_added", "comment", "review", "manual_update"].includes(type);
}

// Progress validation
function validateProgress(currentPage: number, totalPages: number): boolean {
  return currentPage >= 0 && totalPages > 0 && currentPage <= totalPages;
}
```

### Reading State Machine Constants

```typescript
// Defines valid state transitions for books
const READING_STATE_TRANSITIONS: Record<ReadingState, ReadingState[]> = {
  not_started: ["in_progress"],
  in_progress: ["finished"],
  finished: [],
};

// Validates if a state transition is allowed
function canTransitionTo(currentState: ReadingState, newState: ReadingState): boolean {
  if (!READING_STATE_TRANSITIONS[currentState]) {
    return false;
  }
  return READING_STATE_TRANSITIONS[currentState].includes(newState);
}
```

## Future Expansion

The current data model architecture supports advanced features:

### Planned Enhancements
- **Book Sharing**: Multi-user collections and collaborative reading
- **Reading Goals**: Goal tracking with progress analytics
- **Social Features**: Friend connections and reading recommendations
- **Advanced Analytics**: Reading pattern analysis and insights
- **Offline Support**: Local storage with synchronization capabilities

### Scalability Considerations
- **Genre Normalization**: Standardized genre taxonomy for better categorization
- **Performance Optimization**: Indexed queries and pagination for large collections
- **Data Migration**: Version-aware schema evolution for model updates
- **Caching Strategy**: Repository-level caching for frequently accessed data

The robust data model foundation provides extensibility without breaking changes to existing functionality, ensuring smooth evolution as new features are added.
