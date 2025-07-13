import {
  READING_STATE_TRANSITIONS,
  canTransitionTo,
  isValidEventType,
  isValidReadingState,
  validateProgress,
  validateRating,
  type Book,
  type BookEvent,
  type EventType,
  type ReadingState,
  type UserProfile,
} from "../models";

describe("Type Guards", () => {
  describe("isValidReadingState", () => {
    it("should return true for valid reading states", () => {
      expect(isValidReadingState("not_started")).toBe(true);
      expect(isValidReadingState("in_progress")).toBe(true);
      expect(isValidReadingState("finished")).toBe(true);
    });

    it("should return false for invalid reading states", () => {
      expect(isValidReadingState("invalid")).toBe(false);
      expect(isValidReadingState("reading")).toBe(false);
      expect(isValidReadingState("completed")).toBe(false);
      expect(isValidReadingState("")).toBe(false);
      expect(isValidReadingState("NOT_STARTED")).toBe(false);
    });

    it("should handle non-string inputs", () => {
      expect(isValidReadingState(null as any)).toBe(false);
      expect(isValidReadingState(undefined as any)).toBe(false);
      expect(isValidReadingState(123 as any)).toBe(false);
      expect(isValidReadingState({} as any)).toBe(false);
    });
  });

  describe("isValidEventType", () => {
    it("should return true for valid event types", () => {
      expect(isValidEventType("state_change")).toBe(true);
      expect(isValidEventType("progress_update")).toBe(true);
      expect(isValidEventType("rating_added")).toBe(true);
      expect(isValidEventType("note_added")).toBe(true);
    });

    it("should return false for invalid event types", () => {
      expect(isValidEventType("invalid")).toBe(false);
      expect(isValidEventType("book_added")).toBe(false);
      expect(isValidEventType("STATE_CHANGE")).toBe(false);
      expect(isValidEventType("")).toBe(false);
    });

    it("should handle non-string inputs", () => {
      expect(isValidEventType(null as any)).toBe(false);
      expect(isValidEventType(undefined as any)).toBe(false);
      expect(isValidEventType(123 as any)).toBe(false);
      expect(isValidEventType({} as any)).toBe(false);
    });
  });
});

describe("Validation Functions", () => {
  describe("validateProgress", () => {
    it("should return true for valid progress", () => {
      expect(validateProgress({ currentPage: 0, totalPages: 0 })).toBe(true);
      expect(validateProgress({ currentPage: 50, totalPages: 100 })).toBe(true);
      expect(validateProgress({ currentPage: 100, totalPages: 100 })).toBe(
        true
      );
      expect(validateProgress({ currentPage: 0, totalPages: 500 })).toBe(true);
    });

    it("should return false for invalid progress", () => {
      // Negative total pages
      expect(validateProgress({ currentPage: 0, totalPages: -1 })).toBe(false);
      expect(validateProgress({ currentPage: 10, totalPages: -10 })).toBe(
        false
      );

      // Negative current page
      expect(validateProgress({ currentPage: -1, totalPages: 100 })).toBe(
        false
      );
      expect(validateProgress({ currentPage: -10, totalPages: 100 })).toBe(
        false
      );

      // Current page exceeds total pages
      expect(validateProgress({ currentPage: 101, totalPages: 100 })).toBe(
        false
      );
      expect(validateProgress({ currentPage: 500, totalPages: 100 })).toBe(
        false
      );
    });

    it("should handle edge cases", () => {
      // Zero values
      expect(validateProgress({ currentPage: 0, totalPages: 0 })).toBe(true);

      // Large numbers
      expect(validateProgress({ currentPage: 1000, totalPages: 1000 })).toBe(
        true
      );
      expect(validateProgress({ currentPage: 999, totalPages: 1000 })).toBe(
        true
      );
    });
  });

  describe("validateRating", () => {
    it("should return true for valid ratings", () => {
      expect(validateRating(1)).toBe(true);
      expect(validateRating(2)).toBe(true);
      expect(validateRating(3)).toBe(true);
      expect(validateRating(4)).toBe(true);
      expect(validateRating(5)).toBe(true);
    });

    it("should return false for invalid ratings", () => {
      expect(validateRating(0)).toBe(false);
      expect(validateRating(6)).toBe(false);
      expect(validateRating(-1)).toBe(false);
      expect(validateRating(10)).toBe(false);
    });

    it("should handle decimal values", () => {
      expect(validateRating(3.5)).toBe(true);
      expect(validateRating(1.1)).toBe(true);
      expect(validateRating(4.9)).toBe(true);
      expect(validateRating(0.5)).toBe(false);
      expect(validateRating(5.1)).toBe(false);
    });

    it("should handle non-number inputs", () => {
      expect(validateRating("3" as any)).toBe(false);
      expect(validateRating(null as any)).toBe(false);
      expect(validateRating(undefined as any)).toBe(false);
      expect(validateRating(NaN)).toBe(false);
    });
  });
});

describe("State Transitions", () => {
  describe("READING_STATE_TRANSITIONS", () => {
    it("should define correct transitions", () => {
      expect(READING_STATE_TRANSITIONS.not_started).toEqual(["in_progress"]);
      expect(READING_STATE_TRANSITIONS.in_progress).toEqual(["finished"]);
      expect(READING_STATE_TRANSITIONS.finished).toEqual([]);
    });

    it("should have all reading states defined", () => {
      expect(Object.keys(READING_STATE_TRANSITIONS)).toEqual([
        "not_started",
        "in_progress",
        "finished",
      ]);
    });
  });

  describe("canTransitionTo", () => {
    it("should allow valid transitions", () => {
      expect(canTransitionTo("not_started", "in_progress")).toBe(true);
      expect(canTransitionTo("in_progress", "finished")).toBe(true);
    });

    it("should reject invalid transitions", () => {
      // Cannot skip states
      expect(canTransitionTo("not_started", "finished")).toBe(false);

      // Cannot go backwards
      expect(canTransitionTo("in_progress", "not_started")).toBe(false);
      expect(canTransitionTo("finished", "in_progress")).toBe(false);
      expect(canTransitionTo("finished", "not_started")).toBe(false);
    });

    it("should reject transitions from finished state", () => {
      expect(canTransitionTo("finished", "in_progress")).toBe(false);
      expect(canTransitionTo("finished", "not_started")).toBe(false);
      expect(canTransitionTo("finished", "finished")).toBe(false);
    });

    it("should reject same-state transitions", () => {
      expect(canTransitionTo("not_started", "not_started")).toBe(false);
      expect(canTransitionTo("in_progress", "in_progress")).toBe(false);
      expect(canTransitionTo("finished", "finished")).toBe(false);
    });

    it("should handle invalid state inputs", () => {
      expect(canTransitionTo("invalid" as ReadingState, "in_progress")).toBe(
        false
      );
      expect(canTransitionTo("not_started", "invalid" as ReadingState)).toBe(
        false
      );
    });
  });
});

describe("Type Aliases", () => {
  it("should export correct type aliases", () => {
    // Test that the type aliases are correctly exported
    const readingState: ReadingState = "not_started";
    const eventType: EventType = "state_change";

    expect(typeof readingState).toBe("string");
    expect(typeof eventType).toBe("string");
  });
});

describe("Interface Definitions", () => {
  describe("Book interface", () => {
    it("should allow creation of valid Book objects", () => {
      const book: Book = {
        id: "test-id",
        title: "Test Book",
        author: "Test Author",
        state: "not_started",
        progress: {
          currentPage: 0,
          totalPages: 100,
        },
        isOwned: false,
        addedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      };

      expect(book.id).toBe("test-id");
      expect(book.title).toBe("Test Book");
      expect(book.author).toBe("Test Author");
      expect(book.state).toBe("not_started");
      expect(book.progress.currentPage).toBe(0);
      expect(book.progress.totalPages).toBe(100);
      expect(book.isOwned).toBe(false);
    });

    it("should allow optional fields", () => {
      const bookWithOptionals: Book = {
        id: "test-id",
        title: "Test Book",
        author: "Test Author",
        state: "finished",
        progress: {
          currentPage: 100,
          totalPages: 100,
        },
        isOwned: true,
        rating: 5,
        isbn: "1234567890",
        coverImage: "https://example.com/cover.jpg",
        genre: "Fantasy",
        publishedDate: "2023-01-01",
        description: "A great book",
        addedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        startedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        finishedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      };

      expect(bookWithOptionals.rating).toBe(5);
      expect(bookWithOptionals.isbn).toBe("1234567890");
      expect(bookWithOptionals.coverImage).toBe(
        "https://example.com/cover.jpg"
      );
      expect(bookWithOptionals.genre).toBe("Fantasy");
      expect(bookWithOptionals.publishedDate).toBe("2023-01-01");
      expect(bookWithOptionals.description).toBe("A great book");
    });
  });

  describe("BookEvent interface", () => {
    it("should allow creation of valid BookEvent objects", () => {
      const event: BookEvent = {
        id: "event-id",
        bookId: "book-id",
        userId: "user-id",
        type: "state_change",
        timestamp: { seconds: 1234567890, nanoseconds: 0 } as any,
        data: {
          previousState: "not_started",
          newState: "in_progress",
        },
      };

      expect(event.id).toBe("event-id");
      expect(event.bookId).toBe("book-id");
      expect(event.userId).toBe("user-id");
      expect(event.type).toBe("state_change");
      expect(event.data.previousState).toBe("not_started");
      expect(event.data.newState).toBe("in_progress");
    });

    it("should allow different event types with appropriate data", () => {
      const progressEvent: BookEvent = {
        id: "progress-event",
        bookId: "book-id",
        userId: "user-id",
        type: "progress_update",
        timestamp: { seconds: 1234567890, nanoseconds: 0 } as any,
        data: {
          previousPage: 50,
          newPage: 75,
        },
      };

      const ratingEvent: BookEvent = {
        id: "rating-event",
        bookId: "book-id",
        userId: "user-id",
        type: "rating_added",
        timestamp: { seconds: 1234567890, nanoseconds: 0 } as any,
        data: {
          rating: 4,
        },
      };

      expect(progressEvent.type).toBe("progress_update");
      expect(progressEvent.data.previousPage).toBe(50);
      expect(progressEvent.data.newPage).toBe(75);

      expect(ratingEvent.type).toBe("rating_added");
      expect(ratingEvent.data.rating).toBe(4);
    });
  });

  describe("UserProfile interface", () => {
    it("should allow creation of valid UserProfile objects", () => {
      const profile: UserProfile = {
        id: "user-id",
        displayName: "John Doe",
        email: "john@example.com",
        createdAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        emailVerified: true,
        lastSignInTime: "2023-01-01T00:00:00Z",
        totalBooksRead: 5,
        currentlyReading: 2,
        booksInLibrary: 10,
      };

      expect(profile.id).toBe("user-id");
      expect(profile.displayName).toBe("John Doe");
      expect(profile.email).toBe("john@example.com");
      expect(profile.emailVerified).toBe(true);
      expect(profile.totalBooksRead).toBe(5);
      expect(profile.currentlyReading).toBe(2);
      expect(profile.booksInLibrary).toBe(10);
    });

    it("should allow optional photoURL", () => {
      const profileWithPhoto: UserProfile = {
        id: "user-id",
        displayName: "John Doe",
        email: "john@example.com",
        photoURL: "https://example.com/photo.jpg",
        createdAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        emailVerified: true,
        lastSignInTime: "2023-01-01T00:00:00Z",
        totalBooksRead: 0,
        currentlyReading: 0,
        booksInLibrary: 0,
      };

      expect(profileWithPhoto.photoURL).toBe("https://example.com/photo.jpg");
    });
  });
});
