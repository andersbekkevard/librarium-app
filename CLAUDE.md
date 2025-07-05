# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server (uses Turbopack for fast builds)
npm run dev

# Build for production
npm run build

# Production server
npm start

# Lint code
npm run lint
```

## Project Architecture

**Librarium** is a personal book collection and reading tracker app built with:

- **Next.js 15** with App Router and TypeScript
- **Firebase** for authentication, Firestore database, and storage
- **TailwindCSS** for styling with custom color system
- **Radix UI** components for accessible UI primitives
- **React 19** with functional components and hooks

### Key Architecture Principles

1. **Firebase-Native Approach**: Direct Firebase SDK integration with real-time Firestore listeners
2. **TypeScript-First**: Comprehensive type safety throughout the codebase
3. **Component Composition**: Reusable UI components following Notion-inspired minimal design
4. **Centralized Color System**: All colors linked to predefined brand colors in `src/lib/colors.ts`

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with fonts (Geist Sans/Mono)
│   ├── page.tsx           # Landing page
│   ├── add-books/         # Add books functionality
│   └── auth-demo/         # Authentication demo
├── components/
│   ├── ui/                # Reusable UI components (Radix-based)
│   ├── AddBooksPage.tsx   # Book adding interface
│   ├── BookCard.tsx       # Book display component
│   ├── GoogleAuth.tsx     # Google authentication
│   ├── Header.tsx         # App header
│   ├── MyLibraryPage.tsx  # Main library interface
│   └── Sidebar.tsx        # Navigation sidebar
├── lib/
│   ├── firebase.ts        # Firebase configuration and exports
│   ├── useAuth.ts         # Authentication hook
│   ├── utils.ts           # Utility functions
│   └── colors.ts          # Centralized color system
└── styles/
    └── colors.md          # Color system documentation
```

## Data Models

### Core Entities

- **Book**: Title, author, ISBN, reading state (not_started/in_progress/finished), progress, metadata
- **BookEvent**: Reading history, comments, quotes, reviews with timestamps
- **Shelf**: Book organization with collaboration features
- **UserProfile**: User data, preferences, statistics

### Reading States
Books follow a strict state machine: `not_started` → `in_progress` → `finished`

## Firebase Integration

### Services Used
- **Authentication**: Email/password and Google OAuth
- **Firestore**: Real-time database with user-centric document structure
- **Storage**: File uploads (book covers, etc.)
- **Analytics**: User behavior tracking

### Database Structure
```
users/{userId}/
├── profile/           # User profile data
├── books/{bookId}/    # User's book collection
├── shelves/{shelfId}/ # Book organization
└── events/{eventId}/  # Reading history
```

## Code Style Guidelines

### General Rules
- Use early returns for better readability
- Implement accessibility features (tabindex, aria-label, etc.)
- Use `const` for function declarations: `const handleClick = () => {}`
- Descriptive naming with "handle" prefix for event functions
- Always use TypeScript types/interfaces

### Styling
- **TailwindCSS only** - no CSS files or style tags
- Use centralized color system from `src/lib/colors.ts`
- Maintain Notion-inspired minimal, clean design
- Reuse existing components before creating new ones
- Use `class:` instead of ternary operators when possible

### Component Development
- Search for existing components before creating new ones
- Follow existing patterns and naming conventions
- Use React hooks and functional components
- Implement proper TypeScript typing
- Focus on readability over performance

## API Integrations

- **Google Books API**: Book metadata fetching and search
- **Firebase Auth**: User authentication and session management
- **Firestore**: Real-time data synchronization

## Testing

The project uses the standard Next.js testing setup. Run tests with appropriate commands based on the testing framework discovered in the codebase.

## Key Features

- Personal book collection management
- Reading progress tracking with page-level progress
- Real-time collaboration on shared books
- Rich interaction history (comments, quotes, reviews)
- Google Books API integration for metadata
- Shelf organization system
- User statistics and analytics dashboard