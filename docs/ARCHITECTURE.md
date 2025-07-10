# Librarium Architecture

## Overview

Librarium is built as a modern web application using **Firebase-native** patterns with **TypeScript-first** development and a **service layer architecture**. The application prioritizes maintainability, type safety, and clear separation of concerns.

## Design Principles

### 1. Service Layer Architecture

- **Repository Pattern**: Data access abstracted through repository interfaces
- **Service Layer**: Business logic centralized in dedicated service classes
- **Provider Pattern**: React Context providers for state management
- **Interface-Driven Design**: Clear contracts between layers

### 2. Firebase-Native Approach

- **Direct Integration**: Use Firebase SDK through repository layer
- **Real-time First**: Leverage Firestore listeners for live data synchronization
- **Serverless Functions**: Use Cloud Functions for external API integration and background tasks
- **Security by Rules**: Implement access control via Firestore security rules

### 3. TypeScript-First Development

- **Compile-time Safety**: Catch errors during development, not runtime
- **Interface-Driven Design**: Define clear contracts between components
- **Utility Functions**: Pure functions for business logic instead of class methods
- **Type Inference**: Leverage TypeScript's inference to reduce boilerplate

### 4. React Patterns

- **Hooks Over Classes**: Functional components with custom hooks for logic
- **Context for Global State**: React Context for user data and authentication
- **Component Composition**: Build complex UI from simple, reusable components
- **Separation of Concerns**: Presentational vs. container components

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Next.js)                        │
├─────────────────────────────────────────────────────────────┤
│  UI Components (React + Tailwind)                          │
│  ├── Pages (Next.js App Router)                            │
│  ├── Components (Reusable UI)                              │
│  └── Context Providers (State management)                  │
├─────────────────────────────────────────────────────────────┤
│  Service Layer                                             │
│  ├── AuthService (Authentication operations)               │
│  ├── UserService (Profile & statistics)                    │
│  └── BookService (Book operations & business logic)        │
├─────────────────────────────────────────────────────────────┤
│  Repository Layer                                          │
│  ├── UserRepository (User data access)                     │
│  ├── BookRepository (Book data access)                     │
│  └── EventRepository (Event logging)                       │
├─────────────────────────────────────────────────────────────┤
│  External APIs                                             │
│  ├── Google Books API (Book metadata)                      │
│  └── Firebase SDK (Database operations)                    │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Backend                         │
├─────────────────────────────────────────────────────────────┤
│  Authentication (Firebase Auth)                             │
│  ├── Email/Password                                         │
│  ├── Social Providers (Google)                             │
│  └── JWT Token Management                                   │
├─────────────────────────────────────────────────────────────┤
│  Database (Firestore)                                       │
│  ├── Real-time Listeners                                    │
│  ├── Security Rules                                         │
│  └── Automatic Indexing                                     │
├─────────────────────────────────────────────────────────────┤
│  Functions (Cloud Functions) - Planned                      │
│  ├── Statistics Computation                                 │
│  └── Background Tasks                                       │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  External Services                          │
├─────────────────────────────────────────────────────────────┤
│  Google Books API (Metadata)                                │
│  Vercel/AWS (Hosting)                                       │
│  CDN (Static Assets)                                        │
└─────────────────────────────────────────────────────────────┘
```

## Database Design (Firestore)

### Schema Principles

- **User-Centric Partitioning**: Data organized under user documents for security and performance
- **Flexible Structure**: NoSQL design that can evolve with requirements
- **Real-time Optimized**: Structure supports efficient real-time queries
- **Event Logging**: All significant actions are logged for analytics and history

### Collection Structure

```
users/{userId}                          # User document
├── profile/main: UserProfile           # User profile data
├── books/{bookId}: Book                 # User's book collection
└── events/{eventId}: BookEvent          # Reading history/events
```

### Data Models

#### User Profile

```typescript
interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  lastSignInTime: string;
  
  // Statistics
  totalBooksRead: number;
  currentlyReading: number;
  booksInLibrary: number;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Book Entity

```typescript
interface Book {
  id: string;
  title: string;
  author: string;
  state: "not_started" | "in_progress" | "finished";
  progress: {
    currentPage: number;
    totalPages: number;
  };
  isOwned: boolean; // true = owned, false = wishlist
  rating?: number; // User's personal rating (1-5)

  // Metadata
  isbn?: string;
  coverImage?: string;
  genre?: string;
  publishedDate?: string;
  description?: string;

  // Timestamps
  addedAt: Timestamp;
  updatedAt: Timestamp;
  startedAt?: Timestamp;
  finishedAt?: Timestamp;
}
```

#### Book Event

```typescript
interface BookEvent {
  id: string;
  bookId: string;
  userId: string;
  type: "state_change" | "progress_update" | "rating_added" | "note_added";
  timestamp: Timestamp;

  // Event-specific data
  data: {
    // State changes
    previousState?: Book["state"];
    newState?: Book["state"];

    // Progress updates
    previousPage?: number;
    newPage?: number;

    // Rating changes
    rating?: number;

    // Notes/comments (future)
    note?: string;
  };
}
```

## Service Layer Pattern

### Repository Layer

Abstracts all data access operations:

```typescript
interface IBookRepository {
  getBook(userId: string, bookId: string): Promise<RepositoryResult<Book | null>>;
  getUserBooks(userId: string): Promise<RepositoryResult<Book[]>>;
  addBook(userId: string, book: Omit<Book, "id" | "addedAt" | "updatedAt">): Promise<RepositoryResult<string>>;
  updateBook(userId: string, bookId: string, updates: Partial<Book>): Promise<RepositoryResult<void>>;
  deleteBook(userId: string, bookId: string): Promise<RepositoryResult<void>>;
  subscribeToUserBooks(userId: string, callback: (books: Book[]) => void): Unsubscribe;
}
```

### Service Layer

Contains all business logic and coordinates between repositories:

```typescript
interface IBookService {
  addBook(userId: string, book: Omit<Book, "id" | "addedAt" | "updatedAt">): Promise<ServiceResult<string>>;
  updateBookProgress(userId: string, bookId: string, currentPage: number): Promise<ServiceResult<void>>;
  updateBookState(userId: string, bookId: string, newState: Book["state"]): Promise<ServiceResult<void>>;
  updateBookRating(userId: string, bookId: string, rating: number): Promise<ServiceResult<void>>;
  calculateProgress(book: Book): number;
  filterAndSortBooks(books: Book[], ...filters): Book[];
}
```

### Provider Layer

React Context providers that consume services:

```typescript
interface BooksContextType {
  books: Book[];
  loading: boolean;
  error: string | null;
  addBook: (book: Omit<Book, "id" | "addedAt" | "updatedAt">) => Promise<string>;
  updateBookProgress: (bookId: string, currentPage: number) => Promise<void>;
  // ... other operations
}
```

## Security Model

### Firestore Security Rules

- Users can only access their own data
- All reads/writes require authentication
- No cross-user data access
- Event logging is append-only

### Authentication Flow

1. User signs in with Google OAuth
2. Firebase Auth creates user session
3. UserService creates/updates profile
4. User gains access to protected routes

## Performance Considerations

### Real-time Synchronization

- Firestore listeners for book collection
- Optimistic updates for better UX
- Error boundaries for resilient UI

### Data Loading

- Lazy loading of book details
- Pagination for large collections (planned)
- Efficient filtering and sorting

## Testing Strategy

- Unit tests for utility functions
- Service layer testing with mocked repositories
- Component testing with React Testing Library
- Integration tests for critical user flows

## Future Enhancements

### Planned Features

1. **Shelf Management**: Custom collections and organization
2. **Collaboration**: Household/family sharing
3. **Enhanced Analytics**: Detailed reading insights
4. **Comments & Quotes**: Rich reading experience features
5. **LLM Integration**: AI-powered recommendations

### Scalability Considerations

- Implement pagination for large libraries
- Add caching layer for frequently accessed data
- Consider CDN for cover images
- Optimize Firestore queries with composite indexes
