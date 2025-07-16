# Requirements Document

## Introduction

The book commenting system allows users to add contextual comments to their books at any point during their reading journey. Comments are stored as book events to maintain a single source of truth and integrate seamlessly with the existing activity tracking system. The feature provides a timeline-based interface for viewing comments and integrates with the dashboard's recent activity feed.

## Requirements

### Requirement 1

**User Story:** As a reader, I want to add comments to my books at any reading state, so that I can capture my thoughts and insights throughout my reading journey.

#### Acceptance Criteria

1. WHEN a user is viewing a book detail page THEN the system SHALL display a "Add Comment" button that is always visible
2. WHEN a user clicks the "Add Comment" button THEN the system SHALL open a comment input interface
3. WHEN a user submits a comment THEN the system SHALL store the comment with the current reading state and page number
4. IF the book has not been started THEN the system SHALL store the comment with reading state "not_started" and page number 0
5. IF the book is currently being read THEN the system SHALL store the comment with reading state "reading" and the current page number
6. IF the book is completed THEN the system SHALL store the comment with reading state "completed" and the total page count

### Requirement 2

**User Story:** As a reader, I want to view my comments in a timeline format on the book detail page, so that I can see the progression of my thoughts while reading.

#### Acceptance Criteria

1. WHEN a user views a book detail page THEN the system SHALL display a comments timeline section
2. WHEN the comments timeline is in default state THEN the system SHALL show only the most recent comment
3. WHEN a user toggles the comments timeline THEN the system SHALL display all comments in chronological order (newest first)
4. WHEN displaying comments THEN each comment SHALL show the comment text, date, and page number
5. WHEN displaying comments THEN each comment SHALL be visually styled as a timeline blob with connecting lines
6. WHEN there are no comments THEN the system SHALL display an appropriate empty state message

### Requirement 3

**User Story:** As a reader, I want to see my recent comments in the dashboard activity feed, so that I can track my recent engagement with books.

#### Acceptance Criteria

1. WHEN a user adds a comment THEN the system SHALL create a book event of type "comment"
2. WHEN the dashboard loads recent activities THEN comment events SHALL be included in the activity feed
3. WHEN displaying comment activities THEN the system SHALL show the book title, comment preview, and timestamp
4. WHEN a user clicks on a comment activity THEN the system SHALL navigate to the book detail page

### Requirement 4

**User Story:** As a developer, I want comments to be stored as book events, so that we maintain a single source of truth for all book-related activities.

#### Acceptance Criteria

1. WHEN a comment is created THEN the system SHALL store it as a BookEvent with type "comment"
2. WHEN storing comment events THEN the system SHALL include reading state, current page, and comment text in the event data
3. WHEN retrieving comments for a book THEN the system SHALL query book events filtered by type "comment" and book ID
4. WHEN the EventsProvider loads THEN comment events SHALL be included in the events array

### Requirement 5

**User Story:** As a developer, I want the commenting system to follow the established architectural patterns, so that the codebase remains maintainable and consistent.

#### Acceptance Criteria

1. WHEN implementing comment functionality THEN the system SHALL follow the Component → Provider → Service → Repository pattern
2. WHEN components need comment data THEN they SHALL only call EventsProvider hooks
3. WHEN the EventsProvider needs to manage comments THEN it SHALL only call EventService methods
4. WHEN the EventService needs to persist comments THEN it SHALL only call EventRepository methods
5. WHEN the EventRepository needs to store data THEN it SHALL only interact with Firebase directly

### Requirement 6

**User Story:** As a reader, I want the commenting interface to match the application's design system, so that it feels integrated and familiar.

#### Acceptance Criteria

1. WHEN displaying the comments timeline THEN the system SHALL use the application's existing color scheme and typography
2. WHEN showing comment input forms THEN the system SHALL use consistent button and input styling
3. WHEN displaying comments THEN the system SHALL follow the minimal, clean, Notion-ish design aesthetic
4. WHEN integrating with the book detail page THEN the comments section SHALL fit seamlessly with existing layout and spacing
5. WHEN showing activity items THEN comment activities SHALL use consistent styling with other activity types