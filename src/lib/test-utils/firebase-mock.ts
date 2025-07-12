import { Book, BookEvent, UserProfile } from "@/lib/models";
import { Timestamp } from "firebase/firestore";

// Mock Firebase User
export const createMockUser = (overrides?: any) => ({
  uid: "test-user-id",
  displayName: "Test User",
  email: "test@example.com",
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: "2023-01-01T00:00:00.000Z",
    lastSignInTime: "2023-01-01T00:00:00.000Z",
  },
  phoneNumber: undefined,
  photoURL: undefined,
  providerData: [],
  refreshToken: "mock-refresh-token",
  tenantId: null,
  providerId: "google.com",
  delete: jest.fn(),
  getIdToken: jest.fn().mockResolvedValue("mock-token"),
  getIdTokenResult: jest.fn(),
  reload: jest.fn(),
  toJSON: jest.fn(),
  ...overrides,
});

// Mock UserProfile
export const createMockUserProfile = (
  overrides?: Partial<UserProfile>
): UserProfile => ({
  id: "test-user-id",
  displayName: "Test User",
  email: "test@example.com",
  photoURL: null,
  totalBooksRead: 5,
  currentlyReading: 2,
  booksInLibrary: 10,
  createdAt: { seconds: 1672531200, nanoseconds: 0 } as Timestamp,
  updatedAt: { seconds: 1672531200, nanoseconds: 0 } as Timestamp,
  emailVerified: true,
  lastSignInTime: "2023-01-01T00:00:00.000Z",
  ...overrides,
});

// Mock Book
export const createMockBook = (overrides?: Partial<Book>): Book => ({
  id: "test-book-id",
  title: "Test Book",
  author: "Test Author",
  state: "not_started",
  progress: { currentPage: 0, totalPages: 200 },
  isOwned: true,
  genre: "Fiction",
  coverImage: "https://example.com/cover.jpg",
  addedAt: { seconds: 1672531200, nanoseconds: 0 } as Timestamp,
  updatedAt: { seconds: 1672531200, nanoseconds: 0 } as Timestamp,
  ...overrides,
});

// Mock BookEvent
export const createMockEvent = (overrides?: Partial<BookEvent>): BookEvent => ({
  id: "test-event-id",
  userId: "test-user-id",
  type: "state_change",
  bookId: "test-book-id",
  timestamp: { seconds: 1672531200, nanoseconds: 0 } as Timestamp,
  data: {},
  ...overrides,
});

// Mock Firestore
export const mockFirestore = {
  data: new Map<string, any[]>(),

  seedData: (collection: string, data: any[]) => {
    mockFirestore.data.set(collection, data);
  },

  clearData: () => {
    mockFirestore.data.clear();
  },

  getData: (collection: string) => {
    return mockFirestore.data.get(collection) || [];
  },
};

// Test data presets
export const testDataPresets = {
  empty: {
    user: null,
    books: [],
    events: [],
  },

  small: {
    user: createMockUserProfile(),
    books: [
      createMockBook(),
      createMockBook({
        id: "book-2",
        title: "Book 2",
        state: "in_progress",
        progress: { currentPage: 50, totalPages: 200 },
      }),
    ],
    events: [
      createMockEvent(),
      createMockEvent({
        id: "event-2",
        type: "progress_update",
        bookId: "book-2",
      }),
    ],
  },

  large: {
    user: createMockUserProfile({ totalBooksRead: 15, currentlyReading: 3 }),
    books: Array.from({ length: 10 }, (_, i) =>
      createMockBook({
        id: `book-${i + 1}`,
        title: `Book ${i + 1}`,
        state: i < 5 ? "finished" : i < 8 ? "in_progress" : "not_started",
        progress: {
          currentPage: i < 5 ? 200 : i < 8 ? 50 + i * 10 : 0,
          totalPages: 200,
        },
      })
    ),
    events: Array.from({ length: 20 }, (_, i) =>
      createMockEvent({
        id: `event-${i + 1}`,
        type: i % 2 === 0 ? "state_change" : "progress_update",
        bookId: `book-${(i % 10) + 1}`,
      })
    ),
  },

  mixed: {
    user: createMockUserProfile({ totalBooksRead: 8, currentlyReading: 2 }),
    books: [
      createMockBook({ state: "finished", rating: 4 }),
      createMockBook({
        id: "book-2",
        title: "In Progress Book",
        state: "in_progress",
        progress: { currentPage: 100, totalPages: 200 },
      }),
      createMockBook({
        id: "book-3",
        title: "Not Started Book",
        state: "not_started",
      }),
    ],
    events: [
      createMockEvent({ type: "rating_added" }),
      createMockEvent({ type: "progress_update", bookId: "book-2" }),
      createMockEvent({ type: "state_change", bookId: "book-3" }),
    ],
  },
};

// Mock Firebase Auth
export const mockFirebaseAuth = {
  currentUser: createMockUser(),
  onAuthStateChanged: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
};

// Mock Firebase Firestore
export const mockFirebaseFirestore = {
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
  limit: jest.fn(),
  onSnapshot: jest.fn(),
  writeBatch: jest.fn(),
};
