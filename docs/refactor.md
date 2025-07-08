# Service Layer Architecture Refactor

## Overview

This document details the comprehensive refactoring of the Librarium application from a prototype-style architecture to a production-ready service layer architecture. The refactor addresses technical debt, improves maintainability, and establishes proper separation of concerns.

## Table of Contents

1. [Background & Motivation](#background--motivation)
2. [Technical Debt Identified](#technical-debt-identified)
3. [Architecture Design](#architecture-design)
4. [Implementation Details](#implementation-details)
5. [Migration Guide](#migration-guide)
6. [Benefits Achieved](#benefits-achieved)
7. [Performance Considerations](#performance-considerations)
8. [Testing Strategy](#testing-strategy)
9. [Future Enhancements](#future-enhancements)

## Background & Motivation

### Original Architecture Problems

The original codebase exhibited several patterns common in prototype-to-production transitions:

1. **Mixed Responsibilities**: `AuthProvider` handled both authentication state AND user profile CRUD operations
2. **Scattered Business Logic**: Complex operations were embedded directly in UI components
3. **Direct Database Coupling**: Components made direct Firebase calls via `firebase-utils`
4. **Inconsistent Error Handling**: Each component handled errors differently
5. **No Clear Boundaries**: Difficult to understand where business logic should reside

### Business Impact

- **Development Velocity**: New features required changes across multiple layers
- **Bug Risk**: Business logic scattered across components made testing difficult
- **Maintenance Burden**: Simple changes required understanding complex component interactions
- **Onboarding Difficulty**: New developers struggled to understand the architecture

## Technical Debt Identified

### 1. Context Provider Anti-patterns

**Problem**: `AuthProvider` was doing too much
```typescript
// BEFORE: Mixed responsibilities
export const AuthProvider = () => {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  
  // User profile management (wrong layer!)
  const createOrUpdateUserProfile = async (firebaseUser: User) => {
    const profileRef = doc(db, `users/${firebaseUser.uid}/profile/main`);
    // Direct Firestore operations in context provider
  };
};
```

**Solution**: Separate concerns into dedicated providers
```typescript
// AFTER: Single responsibility
export const AuthProvider = () => {
  // Only handles authentication state
  const [user, setUser] = useState<User | null>(null);
  // Uses AuthService for operations
};

export const UserProvider = () => {
  // Only handles user profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  // Uses UserService for operations
};
```

### 2. Business Logic in Components

**Problem**: Components contained complex business rules
```typescript
// BEFORE: Business logic embedded in component
const handleUpdateProgress = async () => {
  const newPage = parseInt(currentPageInput) || 0;
  const totalPages = book.progress.totalPages || 0;
  
  // Business logic in UI component
  let newState = book.state;
  if (newPage > 0 && book.state === "not_started") {
    newState = "in_progress";
  } else if (totalPages > 0 && newPage >= totalPages && book.state === "in_progress") {
    newState = "finished";
  }
  
  // Direct Firebase operations
  await bookOperations.updateBook(user.uid, book.id, updatedBook);
  await eventOperations.logEvent(user.uid, eventData);
};
```

**Solution**: Move business logic to service layer
```typescript
// AFTER: Clean component delegation
const handleUpdateProgress = async () => {
  const newPage = parseInt(currentPageInput) || 0;
  await updateBookProgress(book.id, newPage);
};

// Business logic in BookService
async updateBookProgress(userId: string, bookId: string, currentPage: number) {
  // All business logic centralized here
  // State transitions, validation, event logging
}
```

### 3. Inconsistent Error Handling

**Problem**: Each component handled errors differently
```typescript
// BEFORE: Scattered error handling
try {
  await bookOperations.updateBook(user.uid, book.id, updates);
} catch (error) {
  console.error("Error updating book:", error); // Different patterns everywhere
  setError("Failed to update book");
}
```

**Solution**: Standardized error handling in services
```typescript
// AFTER: Consistent error handling
async updateBook(userId: string, bookId: string, updates: Partial<Book>): Promise<ServiceResult<void>> {
  try {
    const result = await this.bookRepository.updateBook(userId, bookId, updates);
    return result.success ? { success: true } : { success: false, error: result.error };
  } catch (error) {
    return { success: false, error: this.handleRepositoryError(error) };
  }
}
```

## Architecture Design

### Layered Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Components  │  │   Pages     │  │   Context Providers │  │
│  │             │  │             │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ AuthService │  │ UserService │  │    BookService      │  │
│  │             │  │             │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Repository Layer                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │ UserRepository  │  │ BookRepository  │  │EventRepository│  │
│  │                 │  │                 │  │             │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
│                    ┌─────────────┐                          │
│                    │  Firebase   │                          │
│                    │  Firestore  │                          │
│                    └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Single Responsibility**: Each service/repository has one clear purpose
2. **Dependency Inversion**: Services depend on repository interfaces, not implementations
3. **Separation of Concerns**: Clear boundaries between layers
4. **Consistent APIs**: All services return standardized result objects
5. **Error Isolation**: Errors are handled at appropriate layers

### Service Layer Responsibilities

#### AuthService
- **Purpose**: Pure authentication operations
- **Responsibilities**:
  - Google OAuth sign-in/sign-out
  - Authentication state management
  - User session validation
- **Does NOT Handle**: User profile data, business logic

#### UserService
- **Purpose**: User profile and statistics management
- **Responsibilities**:
  - User profile CRUD operations
  - Reading statistics calculation
  - Profile validation and business rules
- **Depends On**: UserRepository, BookRepository

#### BookService
- **Purpose**: Book collection and reading progress management
- **Responsibilities**:
  - Book CRUD operations
  - Reading state transitions
  - Progress tracking and validation
  - Event logging coordination
- **Depends On**: BookRepository, EventRepository

### Repository Layer Responsibilities

#### FirebaseUserRepository
- **Purpose**: User profile data persistence
- **Operations**: Create, read, update, delete user profiles
- **Abstracts**: Firebase Firestore user document operations

#### FirebaseBookRepository
- **Purpose**: Book collection data persistence
- **Operations**: Book CRUD, filtering, sorting, batch operations
- **Abstracts**: Firebase Firestore book document operations

#### FirebaseEventRepository
- **Purpose**: Event logging data persistence
- **Operations**: Log events, query event history
- **Abstracts**: Firebase Firestore event document operations

## Implementation Details

### Repository Pattern Implementation

```typescript
// Repository Interface
export interface IBookRepository {
  getBook(userId: string, bookId: string): Promise<RepositoryResult<Book | null>>;
  addBook(userId: string, book: Omit<Book, "id" | "addedAt" | "updatedAt">): Promise<RepositoryResult<string>>;
  updateBook(userId: string, bookId: string, updates: Partial<Book>): Promise<RepositoryResult<void>>;
  // ... other methods
}

// Firebase Implementation
export class FirebaseBookRepository implements IBookRepository {
  async getBook(userId: string, bookId: string): Promise<RepositoryResult<Book | null>> {
    try {
      const bookRef = doc(db, `users/${userId}/books/${bookId}`);
      const bookDoc = await getDoc(bookRef);
      
      if (!bookDoc.exists()) {
        return { success: true, data: null };
      }
      
      return { success: true, data: { id: bookDoc.id, ...bookDoc.data() } as Book };
    } catch (error) {
      return { success: false, error: this.handleFirebaseError(error).message };
    }
  }
}
```

### Service Layer Implementation

```typescript
// Service Interface
export interface IBookService {
  getBook(userId: string, bookId: string): Promise<ServiceResult<Book | null>>;
  updateBookProgress(userId: string, bookId: string, currentPage: number): Promise<ServiceResult<void>>;
  // ... other methods
}

// Service Implementation
export class BookService implements IBookService {
  constructor(
    private bookRepository: IBookRepository,
    private eventRepository: IEventRepository
  ) {}

  async updateBookProgress(userId: string, bookId: string, currentPage: number): Promise<ServiceResult<void>> {
    try {
      // Business logic: Get current book state
      const bookResult = await this.bookRepository.getBook(userId, bookId);
      if (!bookResult.success || !bookResult.data) {
        return { success: false, error: "Book not found" };
      }

      const book = bookResult.data;
      
      // Business logic: Validate progress
      if (currentPage < 0) {
        return { success: false, error: "Invalid page number" };
      }

      // Business logic: Determine state transitions
      let newState = book.state;
      if (book.state === "not_started" && currentPage > 0) {
        newState = "in_progress";
      } else if (book.state === "in_progress" && currentPage >= book.progress.totalPages) {
        newState = "finished";
      }

      // Coordinate repository operations
      await this.bookRepository.updateBook(userId, bookId, {
        progress: { ...book.progress, currentPage },
        state: newState,
        ...(newState === "finished" && { finishedAt: Timestamp.now() })
      });

      // Log event
      await this.eventRepository.logEvent(userId, {
        type: "progress_update",
        bookId,
        data: { previousPage: book.progress.currentPage, newPage: currentPage }
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to update book progress" };
    }
  }
}
```

### Context Provider Refactoring

```typescript
// BEFORE: Mixed responsibilities
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Auth + Profile management mixed together
  const createOrUpdateUserProfile = async (firebaseUser: User) => {
    // Direct Firebase operations
  };
  
  return (
    <AuthContext.Provider value={{ user, userProfile, createOrUpdateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

// AFTER: Single responsibility
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Only authentication operations
  const signInWithGoogle = async () => {
    try {
      await authService.signInWithGoogle();
    } catch (error) {
      setError("Sign-in failed");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { user } = useAuthContext();

  // Only user profile operations
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    const result = await userService.updateProfile(user.uid, updates);
    if (result.success) {
      setUserProfile(result.data!);
    }
  };

  return (
    <UserContext.Provider value={{ userProfile, updateUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};
```

## Migration Guide

### Phase 1: Repository Layer Setup

1. **Create Repository Interfaces**
   ```typescript
   // src/lib/repositories/types.ts
   export interface IUserRepository {
     getProfile(userId: string): Promise<RepositoryResult<UserProfile | null>>;
     // ... other methods
   }
   ```

2. **Implement Firebase Repositories**
   ```typescript
   // src/lib/repositories/FirebaseUserRepository.ts
   export class FirebaseUserRepository implements IUserRepository {
     // Implementation
   }
   ```

3. **Export Repository Instances**
   ```typescript
   // src/lib/repositories/index.ts
   export { firebaseUserRepository } from "./FirebaseUserRepository";
   ```

### Phase 2: Service Layer Setup

1. **Create Service Interfaces**
   ```typescript
   // src/lib/services/types.ts
   export interface IUserService {
     getProfile(userId: string): Promise<ServiceResult<UserProfile | null>>;
   }
   ```

2. **Implement Services**
   ```typescript
   // src/lib/services/UserService.ts
   export class UserService implements IUserService {
     constructor(private userRepository: IUserRepository) {}
   }
   ```

3. **Export Service Instances**
   ```typescript
   // src/lib/services/index.ts
   export { userService } from "./UserService";
   ```

### Phase 3: Provider Refactoring

1. **Create New Provider Structure**
   ```typescript
   // src/lib/providers/AuthProvider.tsx - Authentication only
   // src/lib/providers/UserProvider.tsx - User profile only
   // src/lib/providers/BooksProvider.tsx - Book collection only
   ```

2. **Update Provider Hierarchy**
   ```typescript
   // src/lib/providers/AppProviders.tsx
   export const AppProviders = ({ children }) => (
     <AuthProvider>
       <UserProvider>
         <BooksProvider>
           {children}
         </BooksProvider>
       </UserProvider>
     </AuthProvider>
   );
   ```

### Phase 4: Component Updates

1. **Update Import Statements**
   ```typescript
   // BEFORE
   import { useAuthContext } from "@/lib/AuthProvider";
   
   // AFTER
   import { useAuthContext } from "@/lib/providers/AuthProvider";
   ```

2. **Remove Business Logic from Components**
   ```typescript
   // BEFORE
   const handleUpdateProgress = async () => {
     // Complex business logic here
   };
   
   // AFTER
   const handleUpdateProgress = async () => {
     await updateBookProgress(book.id, newPage);
   };
   ```

### Phase 5: Cleanup

1. **Remove Old Files**
   - Delete old `AuthProvider.tsx` and `BooksProvider.tsx`
   - Remove direct `firebase-utils` usage

2. **Update App Layout**
   ```typescript
   // src/app/(app)/layout.tsx
   import { AppProviders } from "@/lib/providers";
   
   export default function AppLayout({ children }) {
     return (
       <ThemeProvider>
         <AppProviders>
           {children}
         </AppProviders>
       </ThemeProvider>
     );
   }
   ```

## Benefits Achieved

### 1. Improved Maintainability

**Before**: Changing user profile logic required updates across multiple components
**After**: All user profile logic centralized in `UserService`

### 2. Enhanced Testability

**Before**: Testing required mocking Firebase and complex component setup
**After**: Services can be tested independently with mocked repositories

```typescript
// Easy to test
const mockUserRepository = {
  getProfile: jest.fn().mockResolvedValue({ success: true, data: mockProfile })
};
const userService = new UserService(mockUserRepository);
```

### 3. Better Error Handling

**Before**: Each component handled errors differently
**After**: Consistent error handling patterns across all services

### 4. Cleaner Components

**Before**: Components contained complex business logic
**After**: Components focus on presentation and user interaction

### 5. Flexible Architecture

**Before**: Changing data sources required component updates
**After**: Swap repository implementations without touching UI

## Performance Considerations

### 1. Real-time Subscriptions

**Implementation**: Repository layer manages Firestore subscriptions
```typescript
subscribeToUserBooks(userId: string, callback: (books: Book[]) => void): Unsubscribe {
  const booksRef = collection(db, `users/${userId}/books`);
  return onSnapshot(booksRef, (snapshot) => {
    const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(books);
  });
}
```

**Benefits**:
- Centralized subscription management
- Automatic cleanup on component unmount
- No duplicate subscriptions

### 2. Batch Operations

**Implementation**: Repository layer supports batch operations
```typescript
async batchUpdateBooks(userId: string, updates: Array<{bookId: string, data: Partial<Book>}>): Promise<RepositoryResult<void>> {
  const batch = writeBatch(db);
  updates.forEach(({ bookId, data }) => {
    const bookRef = doc(db, `users/${userId}/books/${bookId}`);
    batch.update(bookRef, data);
  });
  await batch.commit();
  return { success: true };
}
```

### 3. Caching Strategy

**Current**: Context providers act as client-side cache
**Future**: Repository layer can implement intelligent caching

## Testing Strategy

### 1. Unit Testing Services

```typescript
describe('BookService', () => {
  let bookService: BookService;
  let mockBookRepository: jest.Mocked<IBookRepository>;
  let mockEventRepository: jest.Mocked<IEventRepository>;

  beforeEach(() => {
    mockBookRepository = {
      getBook: jest.fn(),
      updateBook: jest.fn(),
      // ... other methods
    };
    
    mockEventRepository = {
      logEvent: jest.fn(),
      // ... other methods
    };
    
    bookService = new BookService(mockBookRepository, mockEventRepository);
  });

  it('should update book progress and log event', async () => {
    // Test implementation
  });
});
```

### 2. Integration Testing Repositories

```typescript
describe('FirebaseBookRepository', () => {
  // Test with Firebase emulator
  it('should create and retrieve book', async () => {
    const repository = new FirebaseBookRepository();
    const bookId = await repository.addBook(userId, mockBook);
    const retrievedBook = await repository.getBook(userId, bookId);
    expect(retrievedBook.data).toEqual(expect.objectContaining(mockBook));
  });
});
```

### 3. Component Testing

```typescript
describe('BookCard', () => {
  it('should call updateBookProgress when progress is updated', async () => {
    const mockUpdateProgress = jest.fn();
    render(
      <BooksProvider value={{ updateBookProgress: mockUpdateProgress }}>
        <BookCard book={mockBook} />
      </BooksProvider>
    );
    
    // Interact with component
    fireEvent.click(screen.getByText('Update Progress'));
    
    expect(mockUpdateProgress).toHaveBeenCalledWith(bookId, newPage);
  });
});
```

## Future Enhancements

### 1. Advanced Caching

**Goal**: Implement intelligent caching at repository layer
```typescript
export class CachedBookRepository implements IBookRepository {
  constructor(
    private firebaseRepository: FirebaseBookRepository,
    private cache: CacheService
  ) {}

  async getBook(userId: string, bookId: string): Promise<RepositoryResult<Book | null>> {
    const cached = await this.cache.get(`book:${userId}:${bookId}`);
    if (cached) return { success: true, data: cached };
    
    const result = await this.firebaseRepository.getBook(userId, bookId);
    if (result.success && result.data) {
      await this.cache.set(`book:${userId}:${bookId}`, result.data);
    }
    return result;
  }
}
```

### 2. Event Sourcing

**Goal**: Implement event sourcing for audit trails
```typescript
export class EventSourcingBookService extends BookService {
  async updateBookProgress(userId: string, bookId: string, currentPage: number): Promise<ServiceResult<void>> {
    // Log event first
    await this.eventRepository.logEvent(userId, {
      type: "progress_update_requested",
      bookId,
      data: { currentPage }
    });
    
    // Then execute business logic
    return super.updateBookProgress(userId, bookId, currentPage);
  }
}
```

### 3. Offline Support

**Goal**: Add offline capabilities
```typescript
export class OfflineBookRepository implements IBookRepository {
  constructor(
    private onlineRepository: FirebaseBookRepository,
    private offlineStorage: OfflineStorage
  ) {}

  async getBook(userId: string, bookId: string): Promise<RepositoryResult<Book | null>> {
    if (this.isOnline()) {
      return this.onlineRepository.getBook(userId, bookId);
    } else {
      return this.offlineStorage.getBook(userId, bookId);
    }
  }
}
```

### 4. Command Query Responsibility Segregation (CQRS)

**Goal**: Separate read and write operations
```typescript
export class BookCommandService {
  // Handle writes
  async updateBookProgress(userId: string, bookId: string, currentPage: number): Promise<ServiceResult<void>> {
    // Write operations
  }
}

export class BookQueryService {
  // Handle reads
  async getBook(userId: string, bookId: string): Promise<ServiceResult<Book | null>> {
    // Read operations with potential caching
  }
}
```

## Conclusion

This refactoring transforms the Librarium application from a prototype-style architecture to a production-ready, maintainable system. The service layer architecture provides:

1. **Clear Separation of Concerns**: Each layer has distinct responsibilities
2. **Improved Testability**: Services can be tested independently
3. **Better Maintainability**: Changes are localized to appropriate layers
4. **Enhanced Scalability**: New features can be added without breaking existing code
5. **Consistent Error Handling**: Standardized error patterns across the application

The architecture is now ready for production use and can scale to support additional features and increased user load.

---

*This refactoring was completed on [Date] and represents a significant improvement in the application's architecture and maintainability.*