# Design Document

## Overview

The book commenting system extends the existing event-driven architecture to support user comments on books. Comments are stored as specialized BookEvents with type "comment", maintaining consistency with the current data model while enabling rich commenting functionality. The system integrates seamlessly with the existing UI components and follows the established architectural patterns.

## Architecture

### Data Flow Architecture

The commenting system follows the established layered architecture:

```
BookDetailPage (Component)
    ↓
EventsProvider (Provider)
    ↓
EventService (Service)
    ↓
FirebaseEventRepository (Repository)
    ↓
Firebase Firestore (External)
```

### Event-Driven Design

Comments are stored as BookEvents to maintain a single source of truth and leverage existing infrastructure:

- **Event Type**: New "comment" type added to BookEvent
- **Event Storage**: Uses existing events collection in Firestore
- **Event Processing**: Leverages existing event transformation pipeline
- **Activity Integration**: Comments appear in dashboard activity feed automatically

## Components and Interfaces

### 1. Data Model Extensions

#### BookEvent Type change:
```typescript
// Change existing BookEvent type
// change the note_added type to "comment" everywhere
export type EventType = "state_change" | "progress_update" | "rating_added" | "comment";

// Extend BookEvent data interface
interface BookEventData {
  // ... existing fields
  
  // For comment events
  comment?: string;
  commentState?: ReadingState;
  commentPage?: number;
}
```

#### Comment Interface
```typescript
interface BookComment {
  id: string;
  bookId: string;
  userId: string;
  text: string;
  readingState: ReadingState;
  currentPage: number;
  timestamp: Timestamp;
}
```

### 2. Service Layer Extensions

#### EventService Methods
```typescript
interface IEventService {
  // ... existing methods
  
  /**
   * Add a comment to a book
   */
  addComment(
    userId: string,
    bookId: string,
    comment: string,
    readingState: ReadingState,
    currentPage: number
  ): Promise<ServiceResult<string>>;

  /**
   * Get comments for a specific book
   */
  getBookComments(
    userId: string,
    bookId: string
  ): Promise<ServiceResult<BookComment[]>>;
}
```

### 3. Provider Layer Extensions

#### EventsProvider Methods
```typescript
interface EventsContextType {
  // ... existing fields
  
  // Comment-specific methods
  addComment: (
    bookId: string,
    comment: string,
    readingState: ReadingState,
    currentPage: number
  ) => Promise<void>;
  
  getBookComments: (bookId: string) => BookComment[];
  
  // Loading states
  commentsLoading: boolean;
}
```

### 4. UI Components

#### CommentsSection Component
```typescript
interface CommentsSectionProps {
  book: Book;
  className?: string;
}
```

**Features:**
- Collapsible timeline view (collapsed by default)
- "Add Comment" button always visible
- Timeline shows comments in chronological order (newest first)
- Each comment displays: text, date, page number, reading state
- Empty state when no comments exist

#### CommentForm Component
```typescript
interface CommentFormProps {
  book: Book;
  onSubmit: (comment: string) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}
```

**Features:**
- Textarea for comment input
- Auto-detects current reading state and page
- Submit/Cancel buttons
- Character limit indicator
- Loading state during submission

#### CommentItem Component
```typescript
interface CommentItemProps {
  comment: BookComment;
  isFirst?: boolean;
  isLast?: boolean;
}
```

**Features:**
- Timeline blob design with connecting lines
- Displays comment text, timestamp, page number
- Reading state indicator
- Responsive design for mobile/desktop

## Data Models

### Comment Storage Schema

Comments are stored as BookEvents in the existing events collection:

```typescript
// Firestore path: users/{userId}/events/{eventId}
{
  id: "event_123",
  bookId: "book_456",
  userId: "user_789",
  type: "comment",
  timestamp: Timestamp,
  data: {
    comment: "This chapter was amazing! The plot twist...",
    commentState: "in_progress",
    commentPage: 156
  }
}
```

### Comment Transformation

Comments are transformed from BookEvents to BookComment objects for UI consumption:

```typescript
const transformEventToComment = (event: BookEvent): BookComment => ({
  id: event.id,
  bookId: event.bookId,
  userId: event.userId,
  text: event.data.comment || "",
  readingState: event.data.commentState || "not_started",
  currentPage: event.data.commentPage || 0,
  timestamp: event.timestamp
});
```

## Error Handling

### Validation Rules

1. **Comment Text**: Required, 1-2000 characters
2. **Reading State**: Must be valid ReadingState
3. **Page Number**: Must be >= 0 and <= book.progress.totalPages
4. **User Authentication**: User must be authenticated
5. **Book Ownership**: User must own the book

### Error Scenarios

1. **Network Errors**: Display retry option
2. **Validation Errors**: Show inline validation messages
3. **Permission Errors**: Redirect to authentication
4. **Storage Errors**: Show generic error with support contact

### Error Messages

```typescript
const COMMENT_ERRORS = {
  REQUIRED: "Comment cannot be empty",
  TOO_LONG: "Comment must be less than 2000 characters",
  INVALID_PAGE: "Page number is invalid",
  NETWORK_ERROR: "Failed to save comment. Please try again.",
  PERMISSION_ERROR: "You don't have permission to comment on this book"
};
```

## Testing Strategy

### Unit Tests

1. **EventService.addComment()**: Test comment creation with various inputs
2. **EventService.getBookComments()**: Test comment retrieval and filtering
3. **Comment transformation**: Test event-to-comment conversion
4. **Validation logic**: Test all validation rules
5. **Error handling**: Test error scenarios and recovery

### Integration Tests

1. **End-to-end comment flow**: Add comment → Save → Display
2. **Provider integration**: Test EventsProvider comment methods
3. **UI component integration**: Test form submission and display
4. **Activity feed integration**: Verify comments appear in dashboard

### Component Tests

1. **CommentsSection**: Test expand/collapse, empty states
2. **CommentForm**: Test input validation, submission
3. **CommentItem**: Test display formatting, responsive design
4. **Timeline integration**: Test visual timeline rendering

## UI Design Specifications

### Visual Design

#### Timeline Design
- **Connection Lines**: Vertical line connecting comment blobs
- **Comment Blobs**: Rounded rectangles with subtle shadows
- **Color Scheme**: Uses existing brand colors for consistency
- **Typography**: Follows existing text hierarchy
- **Spacing**: Consistent with existing card components

#### Responsive Behavior
- **Desktop**: Full timeline with side-by-side layout
- **Tablet**: Stacked timeline with reduced spacing
- **Mobile**: Compact timeline with minimal spacing

#### Animation
- **Expand/Collapse**: Smooth height transition (300ms ease-in-out)
- **Comment Addition**: Fade-in animation for new comments
- **Loading States**: Skeleton loading for comment fetching

### Component Layout

#### CommentsSection Layout
```
┌─────────────────────────────────────┐
│ Comments                    [Toggle] │
├─────────────────────────────────────┤
│ [Add Comment]                       │
│                                     │
│ ● Comment text here...              │
│   📅 Dec 15, 2024 • Page 156       │
│ │                                   │
│ ● Another comment...                │
│   📅 Dec 10, 2024 • Page 98        │
│                                     │
│ [Add Comment]                       │
└─────────────────────────────────────┘
```

#### CommentForm Layout
```
┌─────────────────────────────────────┐
│ Add Comment                         │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ What are your thoughts?         │ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│ Page 156 • Currently Reading        │
│                                     │
│ [Cancel]              [Add Comment] │
└─────────────────────────────────────┘
```

### Accessibility

1. **Keyboard Navigation**: Full keyboard support for all interactions
2. **Screen Readers**: Proper ARIA labels and descriptions
3. **Focus Management**: Clear focus indicators and logical tab order
4. **Color Contrast**: Meets WCAG 2.1 AA standards
5. **Text Scaling**: Supports up to 200% text scaling

## Integration Points

### BookDetailPage Integration

The CommentsSection component integrates into the existing BookDetailPage layout:

```typescript
// In BookDetailPage.tsx
<div className="lg:col-span-2 space-y-6">
  <BookInfo book={book} />
  <ProgressTracker ... />
  <ReadingTimeline book={book} />
  <CommentsSection book={book} />  {/* New component */}
</div>
```

### Dashboard Activity Integration

Comments automatically appear in the dashboard activity feed through the existing ActivityItem transformation:

```typescript
// New case in transformEventToActivityItem
case "comment":
  return {
    ...baseItem,
    type: "commented",
    colorClass: BRAND_COLORS.secondary.bg,
    details: truncateText(event.data.comment, 50)
  };
```

### EventsProvider Integration

The EventsProvider is extended to support comment-specific operations while maintaining backward compatibility:

```typescript
// New methods added to existing provider
const addComment = async (bookId: string, comment: string, ...) => {
  const result = await eventService.addComment(userId, bookId, comment, ...);
  if (result.success) {
    await refreshEvents(); // Refresh to include new comment
  }
};
```

## Performance Considerations

### Data Loading

1. **Lazy Loading**: Comments loaded only when timeline is expanded
2. **Caching**: Comments cached in EventsProvider state
3. **Pagination**: Support for paginated comment loading (future enhancement)
4. **Debouncing**: Comment form submission debounced to prevent duplicates

### Memory Management

1. **Event Filtering**: Comments filtered client-side from existing events
2. **State Cleanup**: Comment state cleaned up when component unmounts
3. **Memory Leaks**: Proper cleanup of event listeners and subscriptions

### Network Optimization

1. **Batch Operations**: Multiple comments can be loaded in single request
2. **Compression**: Comment text compressed before storage
3. **Offline Support**: Comments cached for offline viewing (future enhancement)

## Security Considerations

### Data Validation

1. **Input Sanitization**: All comment text sanitized before storage
2. **XSS Prevention**: Comments rendered with proper escaping
3. **Length Limits**: Enforced both client and server-side
4. **Rate Limiting**: Prevent comment spam (future enhancement)

### Access Control

1. **User Authentication**: Comments require authenticated user
2. **Book Ownership**: Users can only comment on their own books
3. **Data Isolation**: Comments isolated by user ID in Firestore
4. **Privacy**: Comments are private to the book owner

## Future Enhancements

### Phase 2 Features

1. **Comment Editing**: Allow users to edit existing comments
2. **Comment Deletion**: Allow users to delete comments
3. **Rich Text**: Support for basic formatting (bold, italic)
4. **Comment Search**: Search within book comments
5. **Comment Export**: Export comments as part of reading notes

### Phase 3 Features

1. **Comment Sharing**: Share specific comments with other users
2. **Comment Reactions**: Like/favorite comments
3. **Comment Threading**: Reply to specific comments
4. **Voice Comments**: Audio comment recording
5. **AI Insights**: AI-generated insights from comment patterns

## Migration Strategy

### Database Migration

No database migration required as comments use existing BookEvent structure:

1. **Backward Compatibility**: Existing events remain unchanged
2. **New Event Type**: "comment" type added to existing enum
3. **Data Structure**: Uses existing event.data field for comment data
4. **Indexing**: Existing indexes support comment queries

### Code Migration

1. **Incremental Rollout**: Feature can be enabled gradually
2. **Feature Flags**: Comment functionality can be toggled
3. **Fallback Behavior**: Graceful degradation if comments fail to load
4. **Testing**: Extensive testing before production deployment

## Conclusion

The book commenting system leverages the existing event-driven architecture to provide a seamless commenting experience. By storing comments as BookEvents, the system maintains data consistency while enabling rich functionality. The design follows established patterns and integrates naturally with the existing UI, ensuring a cohesive user experience that aligns with the application's minimal, clean aesthetic.