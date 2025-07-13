import "@testing-library/jest-dom";

// Mock environment variables
process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY = "test-api-key";
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-api-key";
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "test-auth-domain";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project-id";
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "test-storage-bucket";
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID =
  "test-messaging-sender-id";
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "test-app-id";
process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = "test-measurement-id";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    has: jest.fn(),
    getAll: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    entries: jest.fn(),
  }),
  usePathname: () => "/",
}));

// Firebase mocks are handled in src/lib/test-utils/firebase-mock.ts
// to prevent conflicts and provide better organization

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock window.matchMedia for responsive components
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Suppress console.warn for tests
const originalWarn = console.warn;
console.warn = (...args) => {
  // Suppress specific warnings that are common in tests
  const message = args[0];
  if (
    typeof message === "string" &&
    (message.includes("Google Books API key not found") ||
      message.includes("React Router"))
  ) {
    return;
  }
  originalWarn.apply(console, args);
};
