import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";

// Configure testing library with shorter timeouts
configure({
  asyncUtilTimeout: 2000, // Reduce from default 5000ms to 2000ms
  asyncWrapper: async (cb) => {
    try {
      await cb();
    } catch (error) {
      // Re-throw with more helpful error message for timeouts
      if (error.message?.includes("Timed out")) {
        throw new Error(
          `Test timed out after 2000ms. This usually means:\n` +
          `1. A mock is not properly set up to call callbacks immediately\n` +
          `2. An async operation is taking too long\n` +
          `3. A loading state is not changing as expected\n\n` +
          `Original error: ${error.message}`
        );
      }
      throw error;
    }
  },
});

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

// Mock Response for Node.js environment
global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.headers = new Map(Object.entries(init.headers || {}));
    this.ok = this.status >= 200 && this.status < 300;
  }

  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
  }

  async text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
  }

  async blob() {
    return new Blob([this.body]);
  }

  clone() {
    return new Response(this.body, {
      status: this.status,
      statusText: this.statusText,
      headers: Object.fromEntries(this.headers),
    });
  }
};

// Mock Request for Node.js environment
global.Request = class Request {
  constructor(url, init = {}) {
    this.url = url;
    this.method = init.method || 'GET';
    this.headers = new Map(Object.entries(init.headers || {}));
    this.body = init.body || null;
  }

  clone() {
    return new Request(this.url, {
      method: this.method,
      headers: Object.fromEntries(this.headers),
      body: this.body,
    });
  }
};

// Mock Headers for Node.js environment
global.Headers = class Headers extends Map {
  constructor(init = {}) {
    super(Object.entries(init));
  }

  get(name) {
    return super.get(name.toLowerCase());
  }

  set(name, value) {
    return super.set(name.toLowerCase(), value);
  }

  has(name) {
    return super.has(name.toLowerCase());
  }

  delete(name) {
    return super.delete(name.toLowerCase());
  }
};

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
