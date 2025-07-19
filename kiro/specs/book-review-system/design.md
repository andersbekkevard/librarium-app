# Design Document

## Overview

The book review system extends the existing event-based architecture to support user reviews for finished books. The system integrates seamlessly with the current BookDetailPage layout, repositions the ReadingTimeline component, and adds a new ReviewSection component above the CommentsSection. Reviews are stored as specialized BookEvent objects with type "review", maintaining consistency with the existing data model and service patterns.

## Architecture

### Data Model Extensions

The system leverages the existing `BookEvent` model by introducing a new event type:

```typescript
// Extension to existing BookEvent.type union
type EventType = "state_change" | "progress_update" | "rating_added" | "comment" | "review";

// Extension to existing BookEvent.data interface
interface BookEventData {
  // ... existing fields
  
  // For review events
  review?: string;
  reviewCreatedAt?: Timestamp;
  reviewUpdatedAt?: Timestamp;
}
```

### Service Layer Extensions

The `EventService` will be extended with review-specific methods:

```typescript
interface IEventService {
  // ... existing methods
  
  /**
   * Add a review for a finished book
   */
  addReview(
    userId: string,
    bookId: string,
    reviewText: string
  ): Promise<ServiceResult<string>>;

  /**
   * Update an existing review
   */
  updateReview(
    userId: string,
    bookId: string,
    reviewText: string
  ): Promise<ServiceResult<void>>;

  /**
   * Get review for a specific book
   */
  getBookReview(
    userId: string,
    bookId: string
  ): Promise<ServiceResult<BookReview | null>>;
}
```

### New Data Types

```typescript
/**
 * BookReview represents a user review for UI consumption
 */
export interface BookReview {
  id: string; // Event ID
  bookId: string;
  userId: string;
  text: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Components and Interfaces

### 1. ReviewSection Component

**Location**: `src/components/app/book-detail/ReviewSection.tsx`

**Purpose**: Display existing review with edit functionality

**Props**:
```typescript
interface ReviewSectionProps {
  book: Book;
  className?: string;
}
```

**Features**:
- Only renders when a review exists
- Displays review text with creation/update dates
- Shows "Edit Review" button
- Handles review loading states and errors
- Positioned above CommentsSection

### 2. ReviewDialog Component

**Location**: `src/components/app/book-detail/ReviewDialog.tsx`

**Purpose**: Modal dialog for adding/editing reviews

**Props**:
```typescript
interface ReviewDialogProps {
  book: Book;
  existingReview?: BookReview | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewSaved: () => void;
}
```

**Features**:
- Multi-line textarea for review input
- Pre-populated with existing review text when editing
- Form validation (non-empty review)
- Save/Cancel buttons with loading states
- Success/error feedback

### 3. BookCover Component Updates

**Location**: `src/components/app/BookCover.tsx` (existing)

**Changes**:
- Add "Add Review" button for finished books without reviews
- Button only appears when `book.state === "finished"`
- Integrates with existing action buttons section

### 4. BookDetailPage Layout Updates

**Location**: `src/components/app/BookDetailPage.tsx` (existing)

**Changes**:
- Move ReadingTimeline below BookCover (left column)
- Add ReviewSection above CommentsSection (right column)
- Maintain responsive grid layout
- Add review dialog state management

## Data Models

### Review Validation

```typescript
/**
 * Validates review text content
 */
export const validateReview = (review: string): boolean => {
  if (typeof review !== "string") {
    return false;
  }
  const trimmed = review.trim();
  return trimmed.length >= 10 && trimmed.length <= 5000;
};
```

### Review Event Structure

```typescript
// Example review event
const reviewEvent: BookEvent = {
  id: "event_123",
  bookId: "book_456",
  userId: "user_789",
  type: "review",
  timestamp: Timestamp.now(),
  data: {
    review: "This book was absolutely fantastic...",
    reviewCreatedAt: Timestamp.now(),
    reviewUpdatedAt: Timestamp.now()
  }
};
```

## Error Handling

### Validation Errors
- Empty review text: "Review cannot be empty"
- Review too short: "Review must be at least 10 characters"
- Review too long: "Review cannot exceed 5000 characters"
- Book not finished: "Reviews can only be added to finished books"

### System Errors
- Network failures: "Failed to save review. Please try again."
- Permission errors: "You don't have permission to review this book"
- Book not found: "Book not found"

### Error Display
- Form validation errors: Inline below textarea
- System errors: Toast notifications
- Loading states: Disabled buttons with spinners

## Testing Strategy

### Unit Tests

**ReviewSection Component**:
- Renders only when review exists
- Displays review text and dates correctly
- Shows edit button for existing reviews
- Handles loading and error states

**ReviewDialog Component**:
- Form validation works correctly
- Pre-populates with existing review text
- Handles save/cancel actions
- Shows appropriate loading states

**EventService Extensions**:
- `addReview()` creates correct event structure
- `updateReview()` modifies existing review event
- `getBookReview()` returns correct review data
- Validation functions work correctly

### Integration Tests

**BookDetailPage**:
- Layout changes work correctly
- ReadingTimeline positioned below BookCover
- ReviewSection appears above CommentsSection
- Review dialog opens/closes properly

**End-to-End Workflow**:
- Add review to finished book
- Edit existing review
- Review persists across page refreshes
- Review displays in correct location

### Component Tests

**BookCover Updates**:
- "Add Review" button appears for finished books
- Button hidden for non-finished books
- Button integrates with existing actions

## Implementation Considerations

### Performance
- Reviews loaded lazily when BookDetailPage mounts
- Single review per book (no pagination needed)
- Minimal impact on existing event queries

### Accessibility
- Review dialog has proper ARIA labels
- Keyboard navigation support
- Screen reader announcements for review actions

### Responsive Design
- ReviewSection adapts to mobile layouts
- Review dialog responsive on all screen sizes
- ReadingTimeline maintains functionality when repositioned

### Data Consistency
- Review events follow existing event patterns
- Timestamps handled consistently with other events
- Error handling matches existing service patterns

## Migration Strategy

### Backward Compatibility
- No changes to existing BookEvent structure
- New event type added to union type
- Existing events unaffected

### Deployment
- Service extensions deployed first
- Component updates deployed second
- No database migrations required

### Rollback Plan
- Remove new event type from validation
- Hide review-related UI components
- Existing functionality remains intact