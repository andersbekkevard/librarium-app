import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { FirebaseBookRepository } from "../FirebaseBookRepository";
import { Book } from "../../models";
import { db } from "../../firebase";

// Mock Firebase Firestore
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
  writeBatch: jest.fn(),
  Timestamp: {
    now: jest.fn(),
  },
}));

// Mock Firebase config
jest.mock("../../firebase", () => ({
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

describe("FirebaseBookRepository", () => {
  let repository: FirebaseBookRepository;
  const testUserId = "test-user-id";
  const testBookId = "test-book-id";

  const mockBook: Book = {
    id: testBookId,
    title: "Test Book",
    author: "Test Author",
    state: "not_started",
    progress: { currentPage: 0, totalPages: 200 },
    isOwned: true,
    addedAt: mockTimestamp,
    updatedAt: mockTimestamp,
  };

  const mockBookData = {
    title: "Test Book",
    author: "Test Author",
    state: "not_started",
    progress: { currentPage: 0, totalPages: 200 },
    isOwned: true,
  };

  const mockCollectionRef = { path: `users/${testUserId}/books` };
  const mockDocRef = {
    id: testBookId,
    path: `users/${testUserId}/books/${testBookId}`,
  };
  const mockQuery = { query: "mock-query" };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new FirebaseBookRepository();

    // Setup default mocks
    (Timestamp.now as jest.Mock).mockReturnValue(mockTimestamp);
    (collection as jest.Mock).mockReturnValue(mockCollectionRef);
    (doc as jest.Mock).mockReturnValue(mockDocRef);
    (query as jest.Mock).mockReturnValue(mockQuery);
    (where as jest.Mock).mockReturnValue("where-clause");
    (orderBy as jest.Mock).mockReturnValue("orderBy-clause");
  });

  describe("getBook", () => {
    it("should return book when found", async () => {
      const mockDocSnap = {
        exists: () => true,
        id: testBookId,
        data: () => mockBookData,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const result = await repository.getBook(testUserId, testBookId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: testBookId, ...mockBookData });
      expect(doc).toHaveBeenCalledWith(db, `users/${testUserId}/books/${testBookId}`);
      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
    });
  });

  describe("getUserBooks", () => {
    it("should return all user books", async () => {
      const mockDocs = [
        {
          id: "book-1",
          data: () => ({ ...mockBookData, title: "Book 1" }),
        },
        {
          id: "book-2",
          data: () => ({ ...mockBookData, title: "Book 2" }),
        },
      ];
      const mockSnapshot = { docs: mockDocs };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await repository.getUserBooks(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(collection).toHaveBeenCalledWith(db, `users/${testUserId}/books`);
      expect(query).toHaveBeenCalledWith(mockCollectionRef, "orderBy-clause");
      expect(orderBy).toHaveBeenCalledWith("addedAt", "desc");
      expect(getDocs).toHaveBeenCalledWith(mockQuery);
    });
  });
});