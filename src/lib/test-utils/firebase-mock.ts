import { jest } from "@jest/globals";
import { User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { Book, UserProfile } from "../models/models";

// Mock Firebase Timestamp
export const mockTimestamp = {
  seconds: 1234567890,
  nanoseconds: 0,
  toDate: () => new Date(1234567890000),
} as Timestamp;

// Mock Firestore functions
export const mockFirestore = {
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
  writeBatch: jest.fn(() => ({
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn(),
  })),
  Timestamp: {
    now: jest.fn(() => mockTimestamp),
  },
  clearData: jest.fn(),
  seedData: jest.fn(),
};

// Mock Firebase Auth functions
export const mockAuth = {
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  GoogleAuthProvider: jest.fn(() => ({})),
};

// Mock Firebase App
export const mockFirebaseApp = {
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  getApp: jest.fn(),
};

// Mock Firebase Storage
export const mockStorage = {
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
};

// Mock the entire firebase/firestore module
jest.mock("firebase/firestore", () => mockFirestore);

// Mock the entire firebase/auth module
jest.mock("firebase/auth", () => mockAuth);

// Mock the entire firebase/app module
jest.mock("firebase/app", () => mockFirebaseApp);

// Mock the entire firebase/storage module
jest.mock("firebase/storage", () => mockStorage);

// Mock the firebase.ts config file
jest.mock("../../api/firebase", () => ({
  db: mockFirestore, // Use the mocked firestore
  auth: mockAuth, // Use the mocked auth
  storage: mockStorage, // Use the mocked storage
}));

// Helper to reset all mocks
export const resetFirebaseMocks = () => {
  Object.values(mockFirestore).forEach((mockFn) => {
    if (typeof mockFn === "function") mockFn.mockClear();
  });
  Object.values(mockAuth).forEach((mockFn) => {
    if (typeof mockFn === "function") mockFn.mockClear();
  });
  Object.values(mockFirebaseApp).forEach((mockFn) => {
    if (typeof mockFn === "function") mockFn.mockClear();
  });
  Object.values(mockStorage).forEach((mockFn) => {
    if (typeof mockFn === "function") mockFn.mockClear();
  });
  mockFirestore.writeBatch.mockClear(); // Clear the mock implementation as well
  mockFirestore.Timestamp.now.mockClear();
};

// Mock data creators
export const createMockUser = (overrides?: Partial<User>): User =>
  ({
    uid: "test-user-id",
    email: "test@example.com",
    displayName: "Test User",
    photoURL: "https://example.com/photo.jpg",
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: "2023-01-01T00:00:00.000Z",
      lastSignInTime: "2023-01-01T00:00:00.000Z",
    },
    providerData: [],
    refreshToken: "mock-refresh-token",
    tenantId: null,
    delete: jest.fn(),
    getIdToken: jest.fn(),
    getIdTokenResult: jest.fn(),
    reload: jest.fn(),
    toJSON: jest.fn(),
    ...overrides,
  } as User);

export const createMockUserProfile = (
  overrides?: Partial<UserProfile>
): UserProfile => ({
  id: "test-user-id",
  displayName: "Test User",
  email: "test@example.com",
  photoURL: "https://example.com/photo.jpg",
  createdAt: mockTimestamp,
  updatedAt: mockTimestamp,
  emailVerified: true,
  lastSignInTime: "2023-01-01T00:00:00.000Z",
  totalBooksRead: 0,
  currentlyReading: 0,
  booksInLibrary: 0,
  ...overrides,
});

export const createMockBook = (overrides?: Partial<Book>): Book => ({
  id: "test-book-id",
  title: "Test Book",
  author: "Test Author",
  state: "not_started",
  isOwned: true,
  progress: {
    currentPage: 0,
    totalPages: 100,
  },
  addedAt: mockTimestamp,
  updatedAt: mockTimestamp,
  ...overrides,
});

// Test data presets
export const testDataPresets = {
  empty: {
    user: createMockUserProfile(),
    books: [],
    events: [],
  },
  small: {
    user: createMockUserProfile({
      totalBooksRead: 2,
      currentlyReading: 1,
      booksInLibrary: 3,
    }),
    books: [
      createMockBook({ id: "book-1", title: "Book 1", state: "finished" }),
      createMockBook({ id: "book-2", title: "Book 2", state: "in_progress" }),
      createMockBook({ id: "book-3", title: "Book 3", state: "not_started" }),
    ],
    events: [],
  },
  large: {
    user: createMockUserProfile({
      totalBooksRead: 10,
      currentlyReading: 3,
      booksInLibrary: 15,
    }),
    books: Array.from({ length: 15 }, (_, i) =>
      createMockBook({
        id: `book-${i + 1}`,
        title: `Book ${i + 1}`,
        state: i < 3 ? "in_progress" : i < 10 ? "finished" : "not_started",
      })
    ),
    events: [],
  },
  mixed: {
    user: createMockUserProfile({
      totalBooksRead: 5,
      currentlyReading: 2,
      booksInLibrary: 8,
    }),
    books: [
      createMockBook({
        id: "book-1",
        title: "Fiction Book",
        state: "finished",
        genre: "Fiction",
      }),
      createMockBook({
        id: "book-2",
        title: "Non-Fiction Book",
        state: "in_progress",
        genre: "Non-Fiction",
      }),
      createMockBook({
        id: "book-3",
        title: "Mystery Book",
        state: "not_started",
        genre: "Mystery",
      }),
    ],
    events: [],
  },
};
