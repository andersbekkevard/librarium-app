import { jest } from "@jest/globals";
import { Timestamp } from "firebase/firestore";

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
jest.mock("../firebase", () => ({
  db: mockFirestore, // Use the mocked firestore
  auth: mockAuth,     // Use the mocked auth
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