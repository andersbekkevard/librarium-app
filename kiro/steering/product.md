# Product Overview

Librarium is a personal library management web application that helps users organize their book collections and track reading progress.

## Core Features

- **Personal Library Management**: Add, organize, and manage book collections with owned/wishlist categorization
- **Reading Progress Tracking**: Track reading state (not started, in progress, finished) with page-level progress
- **Book Discovery**: Integration with Google Books API for automatic metadata retrieval
- **Reading Analytics**: Detailed statistics, charts, and goal tracking
- **User Authentication**: Google OAuth integration for secure user management

## Target Users

Individual readers who want to:
- Organize their personal book collections
- Track reading progress and maintain reading statistics
- Discover new books and manage wishlists
- Monitor reading habits and set goals

## Key Business Rules

- Books have three states: not_started → in_progress → finished (enforced state machine)
- Users can own books or add them to wishlist (isOwned boolean)
- Progress tracking is page-based with validation (currentPage ≤ totalPages)
- Ratings are 1-5 stars with validation
- All user data is scoped per authenticated user
- Events are logged for reading activities to enable timeline features

## Architecture Philosophy

- Service layer pattern with clean separation of concerns
- Repository pattern for data access abstraction
- Type-safe development with comprehensive TypeScript interfaces
- Real-time data synchronization via Firebase listeners
- Event-driven architecture for activity tracking