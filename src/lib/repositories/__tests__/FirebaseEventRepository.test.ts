import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { FirebaseEventRepository } from "../FirebaseEventRepository";
import { BookEvent } from "../../models";
import { RepositoryErrorType } from "../types";

// Mock Firebase Firestore
jest.mock("firebase/firestore", () => ({
  addDoc: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
  limit: jest.fn(),
  orderBy: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  writeBatch: jest.fn(),
  Timestamp: {
    now: jest.fn(),
  },
}));

// Mock Firebase config
jest.mock("../../firebase", () => ({
  db: {},
  auth: {},
  storage: {},
}));

// Mock Firebase Timestamp
const mockTimestamp = {
  seconds: 1234567890,
  nanoseconds: 0,
  toDate: () => new Date(1234567890000),
} as Timestamp;

describe("FirebaseEventRepository", () => {
  let repository: FirebaseEventRepository;
  const testUserId = "test-user-id";
  const testBookId = "test-book-id";
  const testEventId = "test-event-id";

  const mockEvent: BookEvent = {
    id: testEventId,
    bookId: testBookId,
    userId: testUserId,
    type: "state_change",
    timestamp: mockTimestamp,
    data: {
      previousState: "not_started",
      newState: "in_progress",
    },
  };

  const mockEventData = {
    bookId: testBookId,
    type: "state_change",
    data: {
      previousState: "not_started",
      newState: "in_progress",
    },
  };

  const mockCollectionRef = { path: `users/${testUserId}/events` };
  const mockDocRef = { 
    id: testEventId,
    path: `users/${testUserId}/events/${testEventId}`,
  };
  const mockQuery = { query: "mock-query" };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new FirebaseEventRepository();

    // Setup default mocks
    (Timestamp.now as jest.Mock).mockReturnValue(mockTimestamp);
    (collection as jest.Mock).mockReturnValue(mockCollectionRef);
    (query as jest.Mock).mockReturnValue(mockQuery);
    (where as jest.Mock).mockReturnValue("where-clause");
    (orderBy as jest.Mock).mockReturnValue("orderBy-clause");
    (limit as jest.Mock).mockReturnValue("limit-clause");
  });

  describe("logEvent", () => {
    it("should log event successfully", async () => {
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

      const result = await repository.logEvent(testUserId, mockEventData);

      expect(result.success).toBe(true);
      expect(result.data).toBe(testEventId);
      expect(addDoc).toHaveBeenCalledWith(mockCollectionRef, {
        ...mockEventData,
        userId: testUserId,
        timestamp: mockTimestamp,
      });
    });

    it("should handle permission denied error", async () => {
      const error = { code: "permission-denied", message: "Permission denied" };
      (addDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.logEvent(testUserId, mockEventData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Access denied to event collection");
    });

    it("should handle network errors", async () => {
      const error = { code: "unavailable", message: "Network unavailable" };
      (addDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.logEvent(testUserId, mockEventData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error accessing event collection");
    });

    it("should handle deadline exceeded error", async () => {
      const error = { code: "deadline-exceeded", message: "Deadline exceeded" };
      (addDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.logEvent(testUserId, mockEventData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error accessing event collection");
    });

    it("should handle unknown errors", async () => {
      const error = { code: "unknown", message: "Unknown error" };
      (addDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.logEvent(testUserId, mockEventData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error: Unknown error");
    });
  });

  describe("getBookEvents", () => {
    it("should return events for a specific book", async () => {
      const mockDocs = [
        {
          id: "event-1",
          data: () => ({ ...mockEventData, userId: testUserId, timestamp: mockTimestamp }),
        },
        {
          id: "event-2",
          data: () => ({ ...mockEventData, userId: testUserId, timestamp: mockTimestamp, type: "progress_update" }),
        },
      ];
      const mockSnapshot = { docs: mockDocs };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await repository.getBookEvents(testUserId, testBookId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data![0]).toEqual({ id: "event-1", ...mockEventData, userId: testUserId, timestamp: mockTimestamp });
      expect(result.data![1]).toEqual({ id: "event-2", ...mockEventData, userId: testUserId, timestamp: mockTimestamp, type: "progress_update" });
      
      expect(collection).toHaveBeenCalledWith({}, `users/${testUserId}/events`);
      expect(where).toHaveBeenCalledWith("bookId", "==", testBookId);
      expect(orderBy).toHaveBeenCalledWith("timestamp", "desc");
      expect(getDocs).toHaveBeenCalledWith(mockQuery);
    });

    it("should return empty array when no events found", async () => {
      const mockSnapshot = { docs: [] };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await repository.getBookEvents(testUserId, testBookId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("should handle errors", async () => {
      const error = { code: "permission-denied", message: "Permission denied" };
      (getDocs as jest.Mock).mockRejectedValue(error);

      const result = await repository.getBookEvents(testUserId, testBookId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Access denied to event collection");
    });
  });

  describe("getRecentEvents", () => {
    it("should return recent events with default limit", async () => {
      const mockDocs = [
        {
          id: "event-1",
          data: () => ({ ...mockEventData, userId: testUserId, timestamp: mockTimestamp }),
        },
      ];
      const mockSnapshot = { docs: mockDocs };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await repository.getRecentEvents(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0]).toEqual({ id: "event-1", ...mockEventData, userId: testUserId, timestamp: mockTimestamp });
      
      expect(orderBy).toHaveBeenCalledWith("timestamp", "desc");
      expect(limit).toHaveBeenCalledWith(10);
    });

    it("should return recent events with custom limit", async () => {
      const mockDocs = [
        {
          id: "event-1",
          data: () => ({ ...mockEventData, userId: testUserId, timestamp: mockTimestamp }),
        },
      ];
      const mockSnapshot = { docs: mockDocs };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await repository.getRecentEvents(testUserId, 5);

      expect(result.success).toBe(true);
      expect(limit).toHaveBeenCalledWith(5);
    });

    it("should handle errors", async () => {
      const error = { code: "unavailable", message: "Network unavailable" };
      (getDocs as jest.Mock).mockRejectedValue(error);

      const result = await repository.getRecentEvents(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error accessing event collection");
    });
  });

  describe("getEventsByType", () => {
    it("should return events by type", async () => {
      const mockDocs = [
        {
          id: "event-1",
          data: () => ({ ...mockEventData, userId: testUserId, timestamp: mockTimestamp }),
        },
        {
          id: "event-2",
          data: () => ({ ...mockEventData, userId: testUserId, timestamp: mockTimestamp }),
        },
      ];
      const mockSnapshot = { docs: mockDocs };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await repository.getEventsByType(testUserId, "state_change");

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data![0].type).toBe("state_change");
      expect(result.data![1].type).toBe("state_change");
      
      expect(where).toHaveBeenCalledWith("type", "==", "state_change");
      expect(orderBy).toHaveBeenCalledWith("timestamp", "desc");
    });

    it("should handle different event types", async () => {
      const mockDocs = [
        {
          id: "event-1",
          data: () => ({ ...mockEventData, type: "progress_update", userId: testUserId, timestamp: mockTimestamp }),
        },
      ];
      const mockSnapshot = { docs: mockDocs };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await repository.getEventsByType(testUserId, "progress_update");

      expect(result.success).toBe(true);
      expect(result.data![0].type).toBe("progress_update");
      expect(where).toHaveBeenCalledWith("type", "==", "progress_update");
    });

    it("should handle errors", async () => {
      const error = { code: "unknown", message: "Unknown error" };
      (getDocs as jest.Mock).mockRejectedValue(error);

      const result = await repository.getEventsByType(testUserId, "rating_added");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error: Unknown error");
    });
  });

  describe("deleteBookEvents", () => {
    it("should delete events for a book successfully", async () => {
      const mockDocs = [
        {
          id: "event-1",
          ref: { path: `users/${testUserId}/events/event-1` },
        },
        {
          id: "event-2",
          ref: { path: `users/${testUserId}/events/event-2` },
        },
      ];
      const mockSnapshot = { empty: false, docs: mockDocs };
      const mockBatch = {
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
      };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);
      (writeBatch as jest.Mock).mockReturnValue(mockBatch);

      const result = await repository.deleteBookEvents(testUserId, testBookId);

      expect(result.success).toBe(true);
      expect(mockBatch.delete).toHaveBeenCalledTimes(2);
      expect(mockBatch.delete).toHaveBeenCalledWith(mockDocs[0].ref);
      expect(mockBatch.delete).toHaveBeenCalledWith(mockDocs[1].ref);
      expect(mockBatch.commit).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith("bookId", "==", testBookId);
    });

    it("should handle empty snapshot (no events to delete)", async () => {
      const mockSnapshot = { empty: true, docs: [] };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await repository.deleteBookEvents(testUserId, testBookId);

      expect(result.success).toBe(true);
      expect(writeBatch).not.toHaveBeenCalled();
    });

    it("should handle batch commit errors", async () => {
      const mockDocs = [
        {
          id: "event-1",
          ref: { path: `users/${testUserId}/events/event-1` },
        },
      ];
      const mockSnapshot = { empty: false, docs: mockDocs };
      const mockBatch = {
        delete: jest.fn(),
        commit: jest.fn().mockRejectedValue(new Error("Batch commit failed")),
      };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);
      (writeBatch as jest.Mock).mockReturnValue(mockBatch);

      const result = await repository.deleteBookEvents(testUserId, testBookId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error: Batch commit failed");
    });

    it("should handle query errors", async () => {
      const error = { code: "permission-denied", message: "Permission denied" };
      (getDocs as jest.Mock).mockRejectedValue(error);

      const result = await repository.deleteBookEvents(testUserId, testBookId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Access denied to event collection");
    });
  });

  describe("deleteAllUserEvents", () => {
    it("should delete all user events successfully", async () => {
      const mockDocs = [
        {
          id: "event-1",
          ref: { path: `users/${testUserId}/events/event-1` },
        },
        {
          id: "event-2",
          ref: { path: `users/${testUserId}/events/event-2` },
        },
      ];
      const mockSnapshot = { empty: false, docs: mockDocs };
      const mockBatch = {
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
      };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);
      (writeBatch as jest.Mock).mockReturnValue(mockBatch);

      const result = await repository.deleteAllUserEvents(testUserId);

      expect(result.success).toBe(true);
      expect(mockBatch.delete).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it("should handle empty snapshot (no events to delete)", async () => {
      const mockSnapshot = { empty: true, docs: [] };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await repository.deleteAllUserEvents(testUserId);

      expect(result.success).toBe(true);
      expect(writeBatch).not.toHaveBeenCalled();
    });

    it("should handle errors", async () => {
      const error = { code: "permission-denied", message: "Permission denied" };
      (getDocs as jest.Mock).mockRejectedValue(error);

      const result = await repository.deleteAllUserEvents(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Access denied to event collection");
    });
  });

  describe("private methods", () => {
    it("should create correct collection reference", () => {
      // Test is implicit through other tests calling collection()
      expect(collection).toHaveBeenCalledWith({}, `users/${testUserId}/events`);
    });
  });

  describe("error handling edge cases", () => {
    it("should handle errors without code property", async () => {
      const error = { message: "Generic error" };
      (addDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.logEvent(testUserId, mockEventData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error: Generic error");
    });

    it("should handle errors without message property", async () => {
      const error = { code: "unknown" };
      (addDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.logEvent(testUserId, mockEventData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error: undefined");
    });

    it("should handle string errors", async () => {
      const error = "String error";
      (addDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.logEvent(testUserId, mockEventData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error: undefined");
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete event lifecycle", async () => {
      // Log event
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
      
      const logResult = await repository.logEvent(testUserId, mockEventData);
      expect(logResult.success).toBe(true);
      expect(logResult.data).toBe(testEventId);

      // Get book events
      const mockDocs = [
        {
          id: testEventId,
          data: () => ({ ...mockEventData, userId: testUserId, timestamp: mockTimestamp }),
        },
      ];
      const mockSnapshot = { docs: mockDocs };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const getResult = await repository.getBookEvents(testUserId, testBookId);
      expect(getResult.success).toBe(true);
      expect(getResult.data).toHaveLength(1);

      // Delete book events
      const deleteSnapshot = { empty: false, docs: mockDocs.map(doc => ({ ...doc, ref: { path: `users/${testUserId}/events/${doc.id}` } })) };
      const mockBatch = {
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
      };
      (getDocs as jest.Mock).mockResolvedValue(deleteSnapshot);
      (writeBatch as jest.Mock).mockReturnValue(mockBatch);

      const deleteResult = await repository.deleteBookEvents(testUserId, testBookId);
      expect(deleteResult.success).toBe(true);
    });

    it("should handle multiple event types", async () => {
      const eventTypes: BookEvent["type"][] = ["state_change", "progress_update", "rating_added"];
      
      for (const eventType of eventTypes) {
        const mockDocs = [
          {
            id: `event-${eventType}`,
            data: () => ({ ...mockEventData, type: eventType, userId: testUserId, timestamp: mockTimestamp }),
          },
        ];
        const mockSnapshot = { docs: mockDocs };
        (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

        const result = await repository.getEventsByType(testUserId, eventType);
        expect(result.success).toBe(true);
        expect(result.data![0].type).toBe(eventType);
      }
    });

    it("should handle concurrent operations", async () => {
      // Setup mock for concurrent operations
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

      const promises = [
        repository.logEvent(testUserId, mockEventData),
        repository.logEvent(testUserId, { ...mockEventData, type: "progress_update" }),
        repository.logEvent(testUserId, { ...mockEventData, type: "rating_added" }),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.data).toBe(testEventId);
      });
    });
  });

  describe("query optimization", () => {
    it("should use proper query ordering for recent events", async () => {
      const mockSnapshot = { docs: [] };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      await repository.getRecentEvents(testUserId, 5);

      expect(orderBy).toHaveBeenCalledWith("timestamp", "desc");
      expect(limit).toHaveBeenCalledWith(5);
    });

    it("should use proper query ordering for book events", async () => {
      const mockSnapshot = { docs: [] };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      await repository.getBookEvents(testUserId, testBookId);

      expect(where).toHaveBeenCalledWith("bookId", "==", testBookId);
      expect(orderBy).toHaveBeenCalledWith("timestamp", "desc");
    });

    it("should use proper query ordering for events by type", async () => {
      const mockSnapshot = { docs: [] };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      await repository.getEventsByType(testUserId, "state_change");

      expect(where).toHaveBeenCalledWith("type", "==", "state_change");
      expect(orderBy).toHaveBeenCalledWith("timestamp", "desc");
    });
  });
});