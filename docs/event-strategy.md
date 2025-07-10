# Event Tracking Strategy

This document clarifies the event tracking strategy for the Librarium application. It is intended to guide developers and prevent confusion between different types of "events" in the codebase.

## Core Principle

There is **one primary system** for tracking business-level events in Librarium: the **`BookEvent` system**. All significant user actions and changes to data should be recorded as a `BookEvent` and stored in Firestore.

## Types of Events

To avoid confusion, we distinguish between two types of events:

1.  **UI Events:** These are low-level events related to user interaction with the user interface.
    *   **Examples:** Clicks, form submissions, keyboard events (`e.preventDefault()`, `fireEvent`, `userEvent`).
    *   **Purpose:** To trigger application logic in response to user input.
    *   **Implementation:** Handled by React's event system and testing libraries.
    *   **Not to be confused with:** Business-level event tracking.

2.  **Business Events (`BookEvent`):** These are high-level events that represent meaningful actions within the application's domain.
    *   **Examples:** A user marks a book as "finished," updates their reading progress, or adds a rating.
    *   **Purpose:** To create a historical log of user activity, power features like "Recent Activity," and enable future analytics.
    *   **Implementation:** All `BookEvent`s are created and logged through the service layer architecture using `EventRepository`.
    *   **Canonical Model:** The structure of a `BookEvent` is defined in `src/lib/models.ts`.

## The Golden Rule

**UI events trigger business events.**

A UI event (like a button click) should call a provider function that delegates to the service layer, which coordinates business logic and event logging through repositories.

### Example Workflow

1.  **User Action:** The user clicks the "Mark as Finished" button in the UI.
2.  **UI Event:** An `onClick` handler is triggered in the React component.
3.  **Provider Call:** The `onClick` handler calls a provider function like `updateBookState` from `BooksProvider`.
4.  **Service Layer:** The provider calls `BookService.updateBookState()`, which contains the business logic.
5.  **Repository Coordination:** `BookService` updates the book via `BookRepository.updateBook()` and logs the event via `EventRepository.logEvent()`.
6.  **Data Storage:** The new `BookEvent` is saved to Firestore at `users/{userId}/events/{eventId}`.

## Centralized Event Logging

All `BookEvent`s **must** be logged through the service layer architecture. The flow is:

1. **Components** call **Provider** functions
2. **Providers** delegate to **Service** methods
3. **Services** coordinate business logic and call **Repository** methods
4. **EventRepository** handles all event logging to Firestore

This architecture ensures that:
- All events are created consistently with proper timestamps and user information
- Business logic is centralized in services
- Event logging is abstracted through the repository pattern
- Components remain focused on presentation logic

**Do not create `BookEvent` objects manually in components or call repositories directly.**

By following this strategy, we can maintain a clean and understandable event tracking system that is scalable and easy to maintain.
