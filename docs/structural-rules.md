# Architectural Rules & Calling Conventions

## Overview

This document defines the strict architectural rules for the Librarium application's service layer architecture. These rules ensure proper separation of concerns, maintainability, and testability.

## Table of Contents

1. [Layer Definitions](#layer-definitions)
2. [Calling Rules](#calling-rules)
3. [Forbidden Patterns](#forbidden-patterns)
4. [Allowed Patterns](#allowed-patterns)
5. [Import Rules](#import-rules)
6. [Error Handling Rules](#error-handling-rules)
7. [Testing Rules](#testing-rules)
8. [Examples](#examples)

## Layer Definitions

### 🎨 **Presentation Layer**
- **Components**: React components (`.tsx` files in `/components`)
- **Pages**: Next.js page components (`.tsx` files in `/app`)
- **Providers**: React context providers (`.tsx` files in `/lib/providers`)

### 🧠 **Service Layer**
- **Services**: Business logic classes (`.ts` files in `/lib/services`)

### 💾 **Repository Layer**
- **Repositories**: Data access classes (`.ts` files in `/lib/repositories`)

### 🔌 **External Layer**
- **Firebase**: Firestore, Auth, Storage
- **APIs**: Google Books API, external services

## Calling Rules

### ✅ **ALLOWED CALLS**

#### 1. Components → Providers
```typescript
// ✅ Components can ONLY call Provider hooks
const BookCard = () => {
  const { updateBookProgress } = useBooksContext(); // ✅ ALLOWED
  const { user } = useAuthContext(); // ✅ ALLOWED
  
  const handleUpdate = () => {
    updateBookProgress(bookId, newPage); // ✅ ALLOWED
  };
};
```

#### 2. Providers → Services
```typescript
// ✅ Providers can call Service methods
export const BooksProvider = () => {
  const updateBookProgress = async (bookId: string, currentPage: number) => {
    const result = await bookService.updateBookProgress(userId, bookId, currentPage); // ✅ ALLOWED
    if (result.success) {
      setBooks(updatedBooks);
    }
  };
};
```

#### 3. Services → Repositories
```typescript
// ✅ Services can call Repository methods
export class BookService {
  async updateBookProgress(userId: string, bookId: string, currentPage: number) {
    const book = await this.bookRepository.getBook(userId, bookId); // ✅ ALLOWED
    await this.bookRepository.updateBook(userId, bookId, updates); // ✅ ALLOWED
    await this.eventRepository.logEvent(userId, eventData); // ✅ ALLOWED
  }
}
```

#### 4. Services → Other Services (Same Layer)
```typescript
// ✅ Services can call other Services when needed
export class BookService {
  constructor(
    private bookRepository: IBookRepository,
    private userService: UserService // ✅ ALLOWED - service dependency
  ) {}
  
  async addBook(userId: string, book: Book) {
    const userProfile = await this.userService.getProfile(userId); // ✅ ALLOWED
    // ... business logic
  }
}
```

#### 5. Repositories → External Services
```typescript
// ✅ Repositories can call external data sources
export class FirebaseBookRepository {
  async getBook(userId: string, bookId: string) {
    const bookRef = doc(db, `users/${userId}/books/${bookId}`); // ✅ ALLOWED
    const bookDoc = await getDoc(bookRef); // ✅ ALLOWED
    return bookDoc.data();
  }
}
```

### ❌ **FORBIDDEN CALLS**

#### 1. Components → Services (NEVER)
```typescript
// ❌ Components cannot call Services directly
const BookCard = () => {
  const handleUpdate = async () => {
    await bookService.updateBookProgress(userId, bookId, newPage); // ❌ FORBIDDEN
  };
};
```

#### 2. Components → Repositories (NEVER)
```typescript
// ❌ Components cannot call Repositories directly
const BookCard = () => {
  const handleUpdate = async () => {
    await bookRepository.updateBook(userId, bookId, updates); // ❌ FORBIDDEN
  };
};
```

#### 3. Components → External Services (NEVER)
```typescript
// ❌ Components cannot call Firebase/APIs directly
const BookCard = () => {
  const handleUpdate = async () => {
    const bookRef = doc(db, `users/${userId}/books/${bookId}`); // ❌ FORBIDDEN
    await updateDoc(bookRef, updates); // ❌ FORBIDDEN
  };
};
```

#### 4. Providers → Repositories (NEVER)
```typescript
// ❌ Providers cannot skip Services and call Repositories
export const BooksProvider = () => {
  const updateBook = async (bookId: string, updates: Partial<Book>) => {
    await bookRepository.updateBook(userId, bookId, updates); // ❌ FORBIDDEN
  };
};
```

#### 5. Repositories → Services (NEVER)
```typescript
// ❌ Repositories cannot call Services (circular dependency)
export class FirebaseBookRepository {
  async updateBook(userId: string, bookId: string, updates: Partial<Book>) {
    await bookService.validateBookUpdate(updates); // ❌ FORBIDDEN
    // ... update logic
  }
}
```

#### 6. Repositories → Providers (NEVER)
```typescript
// ❌ Repositories cannot call Providers
export class FirebaseBookRepository {
  async getBooks(userId: string) {
    const books = await this.fetchBooks(userId);
    booksProvider.setBooks(books); // ❌ FORBIDDEN
    return books;
  }
}
```

## Import Rules

### ✅ **ALLOWED IMPORTS**

#### Components
```typescript
// ✅ Components can import:
import { useBooksContext } from "@/lib/providers/BooksProvider"; // Providers
import { Button } from "@/components/ui/button"; // Other Components
import { BookCard } from "@/components/app/BookCard"; // Other Components
```

#### Providers
```typescript
// ✅ Providers can import:
import { bookService } from "@/lib/services"; // Services
import { authService } from "@/lib/services"; // Services
import React, { createContext } from "react"; // React utilities
```

#### Services
```typescript
// ✅ Services can import:
import { bookRepository } from "@/lib/repositories"; // Repositories
import { eventRepository } from "@/lib/repositories"; // Repositories
import { userService } from "@/lib/services"; // Other Services
import type { Book, ServiceResult } from "@/lib/models"; // Types
```

#### Repositories
```typescript
// ✅ Repositories can import:
import { db } from "@/lib/firebase"; // External services
import { doc, getDoc, updateDoc } from "firebase/firestore"; // External libraries
import type { Book, RepositoryResult } from "@/lib/models"; // Types
```

### ❌ **FORBIDDEN IMPORTS**

```typescript
// ❌ Components importing Services or Repositories
import { bookService } from "@/lib/services"; // FORBIDDEN in components
import { bookRepository } from "@/lib/repositories"; // FORBIDDEN in components

// ❌ Providers importing Repositories
import { bookRepository } from "@/lib/repositories"; // FORBIDDEN in providers

// ❌ Repositories importing Services or Providers
import { bookService } from "@/lib/services"; // FORBIDDEN in repositories
import { useBooksContext } from "@/lib/providers"; // FORBIDDEN in repositories

// ❌ Services importing Providers
import { useBooksContext } from "@/lib/providers"; // FORBIDDEN in services
```

## Error Handling Rules

### Rule 1: Each Layer Handles Its Own Concerns

```typescript
// ✅ Repository: Handle data access errors
export class FirebaseBookRepository {
  async getBook(userId: string, bookId: string): Promise<RepositoryResult<Book | null>> {
    try {
      const bookDoc = await getDoc(bookRef);
      return { success: true, data: bookDoc.data() };
    } catch (error) {
      return { success: false, error: "Failed to fetch book from database" }; // ✅ Data layer error
    }
  }
}

// ✅ Service: Handle business logic errors
export class BookService {
  async updateBookProgress(userId: string, bookId: string, currentPage: number): Promise<ServiceResult<void>> {
    if (currentPage < 0) {
      return { success: false, error: "Page number cannot be negative" }; // ✅ Business logic error
    }
    
    const result = await this.bookRepository.getBook(userId, bookId);
    if (!result.success) {
      return { success: false, error: "Could not update progress: book not found" }; // ✅ Service-level error
    }
  }
}

// ✅ Provider: Handle UI/state errors
export const BooksProvider = () => {
  const [error, setError] = useState<string | null>(null);
  
  const updateBookProgress = async (bookId: string, currentPage: number) => {
    const result = await bookService.updateBookProgress(userId, bookId, currentPage);
    if (!result.success) {
      setError("Failed to update book progress. Please try again."); // ✅ UI-friendly error
    }
  };
};
```

## Testing Rules

### Rule 1: Test Each Layer Independently

```typescript
// ✅ Service Test: Mock repositories
describe('BookService', () => {
  let bookService: BookService;
  let mockBookRepository: jest.Mocked<IBookRepository>;

  beforeEach(() => {
    mockBookRepository = {
      getBook: jest.fn(),
      updateBook: jest.fn(),
    };
    bookService = new BookService(mockBookRepository, mockEventRepository);
  });

  it('should update book progress', async () => {
    mockBookRepository.getBook.mockResolvedValue({ success: true, data: mockBook });
    // Test service logic without actual database calls
  });
});

// ✅ Repository Test: Test with real/emulated external services
describe('FirebaseBookRepository', () => {
  it('should store and retrieve book', async () => {
    const repository = new FirebaseBookRepository();
    // Test with Firebase emulator
  });
});

// ✅ Component Test: Mock providers
describe('BookCard', () => {
  it('should call updateBookProgress when button clicked', () => {
    const mockUpdateProgress = jest.fn();
    
    render(
      <BooksProvider value={{ updateBookProgress: mockUpdateProgress }}>
        <BookCard book={mockBook} />
      </BooksProvider>
    );
    
    fireEvent.click(screen.getByText('Update'));
    expect(mockUpdateProgress).toHaveBeenCalled();
  });
});
```

## Dependency Flow Diagram

```
┌─────────────────┐
│   Components    │ ──┐
└─────────────────┘   │
          │           │ ❌ FORBIDDEN
          ▼           │
┌─────────────────┐   │
│   Providers     │ ◄─┘
└─────────────────┘
          │
          ▼
┌─────────────────┐
│    Services     │ ◄─┐ ✅ Services can call other Services
└─────────────────┘   │
          │           │
          ▼           │
┌─────────────────┐   │
│  Repositories   │ ──┘
└─────────────────┘
          │
          ▼
┌─────────────────┐
│ External APIs   │
│   (Firebase)    │
└─────────────────┘
```

## Examples

### ✅ **CORRECT Example: Adding a Book**

```typescript
// 1. Component calls Provider
const AddBookForm = () => {
  const { addBook } = useBooksContext(); // ✅

  const handleSubmit = (bookData) => {
    addBook(bookData); // ✅
  };
};

// 2. Provider calls Service
const BooksProvider = () => {
  const addBook = async (bookData: BookData) => {
    const result = await bookService.addBook(userId, bookData); // ✅
    if (result.success) {
      setBooks([...books, result.data]);
    }
  };
};

// 3. Service contains business logic and calls Repository
const BookService = {
  async addBook(userId: string, bookData: BookData): Promise<ServiceResult<Book>> {
    // Business logic: validate, transform, etc.
    const book = this.transformToBook(bookData); // ✅
    
    // Call repository
    const result = await this.bookRepository.addBook(userId, book); // ✅
    
    // Log event
    await this.eventRepository.logEvent(userId, { type: 'book_added', bookId: result.data }); // ✅
    
    return result;
  }
};

// 4. Repository handles data persistence
const FirebaseBookRepository = {
  async addBook(userId: string, book: Book): Promise<RepositoryResult<string>> {
    const bookRef = await addDoc(collection(db, `users/${userId}/books`), book); // ✅
    return { success: true, data: bookRef.id };
  }
};
```

### ❌ **INCORRECT Example: Adding a Book**

```typescript
// ❌ Component calling Service directly
const AddBookForm = () => {
  const handleSubmit = async (bookData) => {
    await bookService.addBook(userId, bookData); // ❌ FORBIDDEN
  };
};

// ❌ Component calling Repository directly
const AddBookForm = () => {
  const handleSubmit = async (bookData) => {
    await bookRepository.addBook(userId, bookData); // ❌ FORBIDDEN
  };
};

// ❌ Provider calling Repository directly
const BooksProvider = () => {
  const addBook = async (bookData: BookData) => {
    await bookRepository.addBook(userId, bookData); // ❌ FORBIDDEN
  };
};
```

## Enforcement

### Code Review Checklist

- [ ] Components only import and call Provider hooks
- [ ] Providers only call Service methods
- [ ] Services only call Repository methods and other Services
- [ ] Repositories only call external APIs/databases
- [ ] No layer skipping (Component → Service, Provider → Repository)
- [ ] No reverse dependencies (Repository → Service, Service → Provider)

### Linting Rules

Consider adding ESLint rules to enforce these patterns:

```json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["**/services/**"],
            "importNames": ["*"],
            "message": "Components cannot import services directly. Use providers instead."
          }
        ]
      }
    ]
  }
}
```

## Conclusion

These rules ensure:

1. **Clear Separation**: Each layer has distinct responsibilities
2. **Maintainability**: Changes are isolated to appropriate layers
3. **Testability**: Each layer can be tested independently
4. **Predictability**: Developers always know where to find and add code

**Remember**: When in doubt, follow the data flow: Component → Provider → Service → Repository → External API

---

*These rules are enforced to maintain the architectural integrity of the Librarium application.* 