# BookKeep Architecture

## Overview

BookKeep is built as a modern web application using **Firebase-native** patterns with **TypeScript-first** development. The architecture prioritizes real-time collaboration, type safety, and developer experience over complex abstractions.

## Design Principles

### 1. Firebase-Native Approach
- **Direct Integration**: Use Firebase SDK directly in React components via hooks
- **Real-time First**: Leverage Firestore listeners for live data synchronization
- **Serverless Functions**: Use Cloud Functions for external API integration and background tasks
- **Security by Rules**: Implement access control via Firestore security rules

### 2. TypeScript-First Development
- **Compile-time Safety**: Catch errors during development, not runtime
- **Interface-Driven Design**: Define clear contracts between components
- **Utility Functions**: Pure functions for business logic instead of class methods
- **Type Inference**: Leverage TypeScript's inference to reduce boilerplate

### 3. React Patterns
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
│  ├── Pages (Next.js routing)                               │
│  ├── Components (Reusable UI)                              │
│  └── Hooks (Data fetching & business logic)                │
├─────────────────────────────────────────────────────────────┤
│  State Management                                           │
│  ├── React Context (Auth, User data)                       │
│  ├── Local State (Component-specific)                      │
│  └── Firebase Listeners (Real-time data)                   │
├─────────────────────────────────────────────────────────────┤
│  Services Layer                                             │
│  ├── Firebase Utils (Firestore operations)                 │
│  ├── Validation Functions (Business logic)                 │
│  └── API Routes (Next.js server functions)                 │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Backend                         │
├─────────────────────────────────────────────────────────────┤
│  Authentication (Firebase Auth)                             │
│  ├── Email/Password                                         │
│  ├── Social Providers (Google, GitHub)                     │
│  └── JWT Token Management                                   │
├─────────────────────────────────────────────────────────────┤
│  Database (Firestore)                                       │
│  ├── Real-time Listeners                                    │
│  ├── Security Rules                                         │
│  └── Automatic Indexing                                     │
├─────────────────────────────────────────────────────────────┤
│  Functions (Cloud Functions)                                │
│  ├── Google Books API Integration                           │
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
- **Collaboration-Ready**: Designed for multi-user access with permission controls

### Collection Structure

```
users/{userId}                          # User document
├── profile: UserProfile                # User profile data
├── statistics: UserStatistics          # Aggregated reading stats
├── books/{bookId}: Book                 # User's book collection
├── shelves/{shelfId}: Shelf             # Book organization
└── events/{eventId}: BookEvent          # Reading history/events

sharedShelves/{shelfId}                  # Top-level shared shelves
├── metadata: ShelfMetadata              # Shelf info and permissions
├── books/{bookId}: SharedBook           # Books in shared shelf
└── activity/{eventId}: ShelfEvent       # Shelf activity log
```

### Data Models

#### User Profile
```typescript
interface UserProfile {
  id: string
  email: string
  displayName: string
  photoURL?: string
  preferences: {
    theme: 'light' | 'dark' | 'system'
    defaultShelf: string
    privacyLevel: 'private' | 'friends' | 'public'
  }
  createdAt: Date
  lastActiveAt: Date
}
```

#### Book Entity
```typescript
interface Book {
  id: string
  title: string
  author: string
  isbn?: string
  state: 'not_started' | 'in_progress' | 'finished'
  progress?: number // Current page for in-progress books
  isOwned: boolean // true = owned, false = wishlist
  
  // Collaboration
  ownerId: string
  collaborators?: string[] // User IDs with access
  sharedIn?: string[] // Shelf IDs where this book appears
  
  // Metadata
  metadata: {
    pages?: number
    genre?: string[]
    publishedYear?: number
    coverUrl?: string
    description?: string
    rating?: number // User's personal rating
  }
  
  // Timestamps  
  createdAt: Date
  updatedAt: Date
  startedAt?: Date
  finishedAt?: Date
}
```

#### Book Event
```typescript
interface BookEvent {
  id: string
  bookId: string
  userId: string
  type: 'state_change' | 'progress_update' | 'comment' | 'quote' | 'review'
  timestamp: Date
  
  // Event-specific data
  data: {
    // State changes
    stateChange?: {
      from: BookState
      to: BookState
    }
    
    // Progress updates
    progressUpdate?: {
      from: number
      to: number
      pagesRead?: number
    }
    
    // User content
    comment?: {
      text: string
      page?: number
    }
    
    quote?: {
      text: string
      page?: number
      chapter?: string
    }
    
    review?: {
      rating: number
      text: string
      spoilerFree: boolean
    }
  }
}
```

#### Shelf Organization
```typescript
interface Shelf {
  id: string
  name: string
  description?: string
  bookIds: string[] // References to books
  
  // Ownership & Sharing
  ownerId: string
  collaborators: {
    userId: string
    permission: 'read' | 'write' | 'admin'
    addedAt: Date
  }[]
  
  // Visibility
  isPublic: boolean
  isDefault: boolean // e.g., "Currently Reading", "Wishlist"
  
  // Organization
  sortOrder: 'manual' | 'title' | 'author' | 'dateAdded' | 'dateRead'
  color?: string
  icon?: string
  
  createdAt: Date
  updatedAt: Date
}
```

#### User Statistics
```typescript
interface UserStatistics {
  userId: string
  
  // Reading Stats
  totalBooks: {
    owned: number
    wishlist: number
    finished: number
    inProgress: number
  }
  
  totalPages: number
  averageRating: number
  
  // Time-based stats
  readingStreaks: {
    current: number
    longest: number
    lastActivityDate: Date
  }
  
  // Goals
  yearlyGoals: {
    [year: string]: {
      target: number
      completed: number
      targetPages?: number
      pagesRead?: number
    }
  }
  
  // Insights
  genreBreakdown: Record<string, number>
  readingSpeed: {
    averagePagesPerDay: number
    averageDaysPerBook: number
  }
  
  // Social
  collaborativeBooks: number
  sharedShelves: number
  
  lastUpdated: Date
}
```

## Deployment Strategy

## Testing Strategy

### Unit Testing
```typescript
// Example test for validation function
describe('Book State Transitions', () => {
  test('should allow transition from not_started to in_progress', () => {
    expect(canTransitionTo('not_started', 'in_progress')).toBe(true)
  })
  
  test('should not allow transition from finished to not_started', () => {
    expect(canTransitionTo('finished', 'not_started')).toBe(false)
  })
})
```