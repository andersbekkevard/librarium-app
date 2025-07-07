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
    *   **Implementation:** All `BookEvent`s are created and logged using the `eventOperations` utility in `src/lib/firebase-utils.ts`.
    *   **Canonical Model:** The structure of a `BookEvent` is defined in `src/lib/models.ts`.

## The Golden Rule

**UI events trigger business events.**

A UI event (like a button click) should call a function that, in turn, calls `eventOperations.logEvent` to record the corresponding business event.

### Example Workflow

1.  **User Action:** The user clicks the "Mark as Finished" button in the UI.
2.  **UI Event:** An `onClick` handler is triggered in the React component.
3.  **Business Logic:** The `onClick` handler calls a function like `handleUpdateBookState`.
4.  **Business Event:** `handleUpdateBookState` calls `bookOperations.updateBookState`, which in turn calls `eventOperations.logEvent` to create a `BookEvent` with the type `state_change`.
5.  **Data Storage:** The new `BookEvent` is saved to Firestore at `users/{userId}/events/{eventId}`.

## Centralized Event Logging

All `BookEvent`s **must** be logged through the `eventOperations` object in `src/lib/firebase-utils.ts`. This ensures that all events are created consistently and that all necessary timestamps and user information are included.

**Do not create `BookEvent` objects manually in components.**

By following this strategy, we can maintain a clean and understandable event tracking system that is scalable and easy to maintain.
