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
import { RepositoryErrorType } from "../types";

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
      expect(doc).toHaveBeenCalledWith({}, `users/${testUserId}/books/${testBookId}`);
      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
    });

    it("should return null when book not found", async () => {
      const mockDocSnap = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const result = await repository.getBook(testUserId, testBookId);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it("should handle permission denied error", async () => {
      const error = { code: "permission-denied", message: "Permission denied" };
      (getDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.getBook(testUserId, testBookId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Access denied to book collection");
    });

    it("should handle network errors", async () => {
      const error = { code: "unavailable", message: "Network unavailable" };
      (getDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.getBook(testUserId, testBookId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error accessing book collection");
    });

    it("should handle deadline exceeded error", async () => {
      const error = { code: "deadline-exceeded", message: "Deadline exceeded" };
      (getDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.getBook(testUserId, testBookId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error accessing book collection");
    });

    it("should handle unknown errors", async () => {
      const error = { code: "unknown", message: "Unknown error" };
      (getDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.getBook(testUserId, testBookId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error: Unknown error");
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
      expect(result.data![0]).toEqual({ id: "book-1", ...mockBookData, title: "Book 1" });
      expect(result.data![1]).toEqual({ id: "book-2", ...mockBookData, title: "Book 2" });
      
      expect(collection).toHaveBeenCalledWith({}, `users/${testUserId}/books`);
      expect(query).toHaveBeenCalledWith(mockCollectionRef, "orderBy-clause");
      expect(orderBy).toHaveBeenCalledWith("addedAt", "desc");
      expect(getDocs).toHaveBeenCalledWith(mockQuery);
    });

    it("should return empty array when no books", async () => {
      const mockSnapshot = { docs: [] };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await repository.getUserBooks(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("should handle errors", async () => {
      const error = { code: "permission-denied", message: "Permission denied" };
      (getDocs as jest.Mock).mockRejectedValue(error);

      const result = await repository.getUserBooks(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Access denied to book collection");
    });
  });

  describe("getBooksByState", () => {
    it("should return books by state", async () => {
      const mockDocs = [
        {
          id: "book-1",
          data: () => ({ ...mockBookData, state: "in_progress" }),
        },
      ];
      const mockSnapshot = { docs: mockDocs };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await repository.getBooksByState(testUserId, "in_progress");

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].state).toBe("in_progress");
      
      expect(where).toHaveBeenCalledWith("state", "==", "in_progress");
      expect(orderBy).toHaveBeenCalledWith("updatedAt", "desc");
    });

    it("should handle errors", async () => {
      const error = { code: "unavailable", message: "Network unavailable" };
      (getDocs as jest.Mock).mockRejectedValue(error);

      const result = await repository.getBooksByState(testUserId, "finished");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error accessing book collection");
    });
  });

  describe("addBook", () => {
    it("should add book successfully", async () => {
      const mockDocRef = { id: "new-book-id" };
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

      const result = await repository.addBook(testUserId, mockBookData);

      expect(result.success).toBe(true);
      expect(result.data).toBe("new-book-id");
      expect(addDoc).toHaveBeenCalledWith(mockCollectionRef, {
        ...mockBookData,
        addedAt: mockTimestamp,
        updatedAt: mockTimestamp,
      });
    });

    it("should handle errors", async () => {
      const error = { code: "permission-denied", message: "Permission denied" };
      (addDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.addBook(testUserId, mockBookData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Access denied to book collection");
    });
  });

  describe("updateBook", () => {
    it("should update book successfully", async () => {
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const updates = { title: "Updated Title" };
      const result = await repository.updateBook(testUserId, testBookId, updates);

      expect(result.success).toBe(true);
      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
        ...updates,
        updatedAt: mockTimestamp,
      });
    });

    it("should handle errors", async () => {
      const error = { code: "not-found", message: "Document not found" };
      (updateDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.updateBook(testUserId, testBookId, { title: "Updated" });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error: Document not found");
    });
  });

  describe("deleteBook", () => {
    it("should delete book successfully", async () => {
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      const result = await repository.deleteBook(testUserId, testBookId);

      expect(result.success).toBe(true);
      expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    });

    it("should handle errors", async () => {
      const error = { code: "permission-denied", message: "Permission denied" };
      (deleteDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.deleteBook(testUserId, testBookId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Access denied to book collection");
    });
  });

  describe("subscribeToUserBooks", () => {
    it("should subscribe to user books", () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      (onSnapshot as jest.Mock).mockReturnValue(mockUnsubscribe);

      const unsubscribe = repository.subscribeToUserBooks(testUserId, mockCallback);

      expect(unsubscribe).toBe(mockUnsubscribe);
      expect(onSnapshot).toHaveBeenCalledWith(
        mockQuery,
        expect.any(Function),
        expect.any(Function)
      );
    });

    it("should handle snapshot data", () => {
      const mockCallback = jest.fn();
      let snapshotHandler: (snapshot: any) => void;
      
      (onSnapshot as jest.Mock).mockImplementation((query, successCallback, errorCallback) => {
        snapshotHandler = successCallback;
        return jest.fn();
      });

      repository.subscribeToUserBooks(testUserId, mockCallback);

      const mockSnapshot = {
        docs: [
          {
            id: "book-1",
            data: () => mockBookData,
          },
        ],
      };

      snapshotHandler(mockSnapshot);

      expect(mockCallback).toHaveBeenCalledWith([
        { id: "book-1", ...mockBookData },
      ]);
    });

    it("should handle subscription errors", () => {
      const mockCallback = jest.fn();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      let errorHandler: (error: any) => void;
      
      (onSnapshot as jest.Mock).mockImplementation((query, successCallback, errorCallback) => {
        errorHandler = errorCallback;
        return jest.fn();
      });

      repository.subscribeToUserBooks(testUserId, mockCallback);

      const error = new Error("Subscription error");
      errorHandler(error);

      expect(consoleSpy).toHaveBeenCalledWith("Error in books subscription:", error);
      expect(mockCallback).toHaveBeenCalledWith([]);
      
      consoleSpy.mockRestore();
    });
  });

  describe("batchUpdateBooks", () => {
    it("should batch update books successfully", async () => {
      const mockBatch = {
        update: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
      };
      (writeBatch as jest.Mock).mockReturnValue(mockBatch);

      const updates = [
        { bookId: "book-1", data: { title: "Updated Book 1" } },
        { bookId: "book-2", data: { title: "Updated Book 2" } },
      ];

      const result = await repository.batchUpdateBooks(testUserId, updates);

      expect(result.success).toBe(true);
      expect(mockBatch.update).toHaveBeenCalledTimes(2);
      expect(mockBatch.update).toHaveBeenCalledWith(mockDocRef, {
        title: "Updated Book 1",
        updatedAt: mockTimestamp,
      });
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it("should handle batch errors", async () => {
      const mockBatch = {
        update: jest.fn(),
        commit: jest.fn().mockRejectedValue(new Error("Batch failed")),
      };
      (writeBatch as jest.Mock).mockReturnValue(mockBatch);

      const updates = [{ bookId: "book-1", data: { title: "Updated" } }];
      const result = await repository.batchUpdateBooks(testUserId, updates);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error: Batch failed");
    });
  });

  describe("importBooks", () => {
    it("should import books successfully", async () => {
      const mockBatch = {
        set: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined),
      };
      (writeBatch as jest.Mock).mockReturnValue(mockBatch);

      const mockNewDocRef = { id: "new-book-id" };
      (doc as jest.Mock).mockReturnValue(mockNewDocRef);

      const booksToImport = [
        mockBookData,
        { ...mockBookData, title: "Second Book" },
      ];

      const result = await repository.importBooks(testUserId, booksToImport);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(["new-book-id", "new-book-id"]);
      expect(mockBatch.set).toHaveBeenCalledTimes(2);
      expect(mockBatch.set).toHaveBeenCalledWith(mockNewDocRef, {
        ...mockBookData,
        addedAt: mockTimestamp,
        updatedAt: mockTimestamp,
      });
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it("should handle import errors", async () => {
      const mockBatch = {
        set: jest.fn(),
        commit: jest.fn().mockRejectedValue(new Error("Import failed")),
      };
      (writeBatch as jest.Mock).mockReturnValue(mockBatch);

      const booksToImport = [mockBookData];
      const result = await repository.importBooks(testUserId, booksToImport);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error: Import failed");
    });
  });

  describe("error handling", () => {
    it("should handle errors without code property", async () => {
      const error = { message: "Generic error" };
      (getDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.getBook(testUserId, testBookId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error: Generic error");
    });

    it("should handle errors without message property", async () => {
      const error = { code: "unknown" };
      (getDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.getBook(testUserId, testBookId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error: undefined");
    });

    it("should handle string errors", async () => {
      const error = "String error";
      (getDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.getBook(testUserId, testBookId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error: undefined");
    });
  });

  describe("private methods", () => {
    it("should create correct collection reference", () => {
      // Test is implicit through other tests calling collection()
      expect(collection).toHaveBeenCalledWith({}, `users/${testUserId}/books`);
    });

    it("should create correct document reference", () => {
      // Test is implicit through other tests calling doc()
      expect(doc).toHaveBeenCalledWith({}, `users/${testUserId}/books/${testBookId}`);
    });
  });
});