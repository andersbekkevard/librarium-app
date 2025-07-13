import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../api/firebase";
import { BookEvent } from "../../models/models";
import { FirebaseEventRepository } from "../FirebaseEventRepository";

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
jest.mock("../../api/firebase", () => ({
  db: { app: { name: "mock-app" } }, // Mock db instance
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

  const mockEventData = {
    bookId: testBookId,
    type: "state_change" as const,
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

      const result = await repository.logEvent(
        testUserId,
        mockEventData as BookEvent
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe(testEventId);
      expect(addDoc).toHaveBeenCalledWith(mockCollectionRef, {
        ...mockEventData,
        userId: testUserId,
        timestamp: mockTimestamp,
      });
    });
  });

  describe("getBookEvents", () => {
    it("should return events for a specific book", async () => {
      const mockDocs = [
        {
          id: "event-1",
          data: () => ({
            ...mockEventData,
            userId: testUserId,
            timestamp: mockTimestamp,
          }),
        },
      ];
      const mockSnapshot = { docs: mockDocs };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await repository.getBookEvents(testUserId, testBookId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(collection).toHaveBeenCalledWith(db, `users/${testUserId}/events`);
      expect(where).toHaveBeenCalledWith("bookId", "==", testBookId);
      expect(orderBy).toHaveBeenCalledWith("timestamp", "desc");
      expect(getDocs).toHaveBeenCalledWith(mockQuery);
    });
  });
});
