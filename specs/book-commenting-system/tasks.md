# Implementation Plan

- [ ] 1. Extend data models and types for comment support
  - Add "comment" to EventType union in models.ts
  - Extend BookEventData interface to include comment fields
  - Create BookComment interface for UI consumption
  - Add comment validation functions
  - Write unit tests for new type guards and validation functions
  - _Requirements: 4.1, 4.2, 5.1_

- [ ] 2. Implement EventService comment methods
  - Add addComment method to EventService class
  - Add getBookComments method to EventService class
  - Implement comment event to BookComment transformation logic
  - Add comment-specific error handling and validation
  - Write unit tests for new EventService methods
  - _Requirements: 1.1, 1.2, 4.3, 5.2_

- [ ] 3. Extend EventsProvider with comment functionality
  - Add addComment method to EventsProvider
  - Add getBookComments method to EventsProvider
  - Add commentsLoading state management
  - Implement comment-specific error handling in provider
  - Update EventsContextType interface with new methods
  - Write unit tests for EventsProvider comment methods
  - _Requirements: 1.1, 5.3, 5.4_

- [ ] 4. Update ActivityItem transformation for comment events
  - Add "comment" case to transformEventToActivityItem method
  - Create transformCommentEvent method in EventService
  - Add "commented" type to ActivityItem type union
  - Implement comment preview truncation for activity display
  - Write unit tests for comment activity transformation
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 5. Create CommentItem component
  - Build CommentItem component with timeline blob design
  - Implement responsive layout for mobile and desktop
  - Add proper timestamp and page number formatting
  - Include reading state indicator styling
  - Add connecting line visual elements for timeline
  - Write component tests for CommentItem
  - _Requirements: 2.4, 2.5, 6.3, 6.4_

- [ ] 6. Create CommentForm component
  - Build CommentForm with textarea input and validation
  - Implement auto-detection of current reading state and page
  - Add character limit indicator and validation
  - Include submit/cancel button functionality
  - Add loading state during comment submission
  - Write component tests for CommentForm
  - _Requirements: 1.1, 1.2, 6.1, 6.2_

- [ ] 7. Create CommentsSection component
  - Build main CommentsSection with collapsible timeline
  - Implement expand/collapse functionality with smooth animations
  - Add "Add Comment" button that's always visible
  - Display comments in chronological order (newest first)
  - Include empty state when no comments exist
  - Write component tests for CommentsSection
  - _Requirements: 2.1, 2.2, 2.3, 2.6_

- [ ] 8. Integrate CommentsSection into BookDetailPage
  - Add CommentsSection component to BookDetailPage layout
  - Position component in the right column after ReadingTimeline
  - Ensure proper spacing and responsive behavior
  - Test integration with existing book detail functionality
  - Verify error handling integration with existing error display
  - Write integration tests for BookDetailPage with comments
  - _Requirements: 2.1, 6.4_

- [ ] 9. Add comment functionality to dashboard activity feed
  - Update ActivityItem type to include "commented" type
  - Ensure comment events appear in recent activities
  - Implement click navigation from comment activity to book detail
  - Add proper styling for comment activity items
  - Test activity feed integration with comment events
  - Write tests for dashboard comment activity display
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 10. Implement comprehensive error handling and validation