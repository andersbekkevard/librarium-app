# Implementation Plan

- [ ] 1. Extend data models and validation for review support
  - Add "review" to EventType union in models.ts
  - Extend BookEventData interface with review fields (review, reviewCreatedAt, reviewUpdatedAt)
  - Create BookReview interface for UI consumption
  - Implement validateReview function with 10-5000 character limits
  - Write unit tests for review validation function
  - _Requirements: 5.4, 6.4_

- [ ] 2. Extend EventService with review management methods
  - Add addReview method to IEventService interface
  - Add updateReview method to IEventService interface  
  - Add getBookReview method to IEventService interface
  - Implement addReview method in EventService class
  - Implement updateReview method in EventService class
  - Implement getBookReview method in EventService class
  - Add transformEventToReview private method
  - Write unit tests for all new EventService methods
  - _Requirements: 1.3, 3.3, 5.1, 5.2_

- [ ] 3. Create ReviewDialog component for adding and editing reviews
  - Create ReviewDialog component file with TypeScript interface
  - Implement dialog UI with textarea for review input
  - Add form validation for review text (non-empty, length limits)
  - Implement save and cancel button functionality
  - Add loading states and disabled button handling
  - Implement pre-population of existing review text for editing
  - Add error display for validation and system errors
  - Write unit tests for ReviewDialog component
  - _Requirements: 1.2, 3.2, 6.1, 6.2, 6.3, 6.4, 6.5, 7.4_

- [ ] 4. Create ReviewSection component for displaying reviews
  - Create ReviewSection component file with TypeScript interface
  - Implement review display with text and timestamps
  - Add "Edit Review" button that opens ReviewDialog
  - Implement conditional rendering (only show when review exists)
  - Add loading states and error handling
  - Style component to match existing design patterns
  - Write unit tests for ReviewSection component
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 7.3_

- [ ] 5. Update BookCover component to add review button for finished books
  - Add "Add Review" button to BookCover component action buttons section
  - Implement conditional rendering (only show for finished books without reviews)
  - Add onClick handler to open ReviewDialog
  - Integrate button with existing action buttons styling
  - Write unit tests for BookCover review button functionality
  - _Requirements: 1.1, 1.5_

- [ ] 6. Update BookDetailPage layout and integrate review components
  - Move ReadingTimeline component below BookCover in left column
  - Add ReviewSection component above CommentsSection in right column
  - Add ReviewDialog state management to BookDetailPage
  - Implement review dialog open/close handlers
  - Add review refresh logic after save operations
  - Ensure responsive layout works with repositioned components
  - Write integration tests for layout changes
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 7. Add review functionality to EventsProvider context
  - Extend EventsProvider with review-related state management
  - Add getBookReview method to context
  - Add addReview method to context
  - Add updateReview method to context
  - Add review loading and error states
  - Implement review caching and state updates
  - Write unit tests for EventsProvider review functionality
  - _Requirements: 5.3, 7.1, 7.2_

- [ ] 8. Implement success and error feedback for review operations
  - Add success toast notifications for review save operations
  - Add error toast notifications for failed review operations
  - Implement proper error message display in ReviewDialog
  - Add loading indicators during review operations
  - Ensure dialog closes automatically on successful save
  - Write tests for feedback and notification functionality
  - _Requirements: 7.1, 7.2, 7.5_

- [ ] 9. Write comprehensive tests for review system integration
  - Write integration tests for complete add review workflow
  - Write integration tests for complete edit review workflow
  - Write tests for review persistence across page refreshes
  - Write tests for proper component positioning and layout
  - Write end-to-end tests for review functionality
  - Test error scenarios and edge cases
  - _Requirements: 1.4, 2.5, 3.4, 3.5_