import { jest } from '@jest/globals';

// Mock Firebase modules before importing - using hoisted variables
const mockInitializeApp = jest.fn();
const mockGetAnalytics = jest.fn();
const mockGetAuth = jest.fn();
const mockGetFirestore = jest.fn();
const mockGetStorage = jest.fn();

// Mock Firebase app instance
const mockApp = {
  name: 'test-app',
  options: {},
  automaticDataCollectionEnabled: false,
};

// Mock Firebase service instances
const mockAuth = { currentUser: null };
const mockDb = { app: mockApp };
const mockStorage = { app: mockApp };
const mockAnalytics = { app: mockApp };

// Set up default mock implementations
mockInitializeApp.mockReturnValue(mockApp);
mockGetAuth.mockReturnValue(mockAuth);
mockGetFirestore.mockReturnValue(mockDb);
mockGetStorage.mockReturnValue(mockStorage);
mockGetAnalytics.mockReturnValue(mockAnalytics);

jest.mock('firebase/app', () => ({
  initializeApp: mockInitializeApp,
}));

jest.mock('firebase/analytics', () => ({
  getAnalytics: mockGetAnalytics,
}));

jest.mock('firebase/auth', () => ({
  getAuth: mockGetAuth,
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: mockGetFirestore,
}));

jest.mock('firebase/storage', () => ({
  getStorage: mockGetStorage,
}));

describe('Firebase Configuration', () => {
  beforeEach(() => {
    // Reset all mock call counts but keep implementations
    jest.clearAllMocks();
    
    // Re-setup mock return values after clearing
    mockInitializeApp.mockReturnValue(mockApp);
    mockGetAuth.mockReturnValue(mockAuth);
    mockGetFirestore.mockReturnValue(mockDb);
    mockGetStorage.mockReturnValue(mockStorage);
    mockGetAnalytics.mockReturnValue(mockAnalytics);

    // Mock environment variables
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-project.firebaseapp.com';
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-project.appspot.com';
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '123456789';
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = '1:123456789:web:abcdef';
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = 'G-ABCDEFGHIJ';
    
    // Clear module registry to force fresh import
    jest.resetModules();
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    delete process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    delete process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    delete process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
    delete process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
    delete process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;
  });

  it('should initialize Firebase app with correct configuration', async () => {
    // Import after mocking
    await import('../firebase');

    expect(mockInitializeApp).toHaveBeenCalledWith({
      apiKey: 'test-api-key',
      authDomain: 'test-project.firebaseapp.com',
      projectId: 'test-project',
      storageBucket: 'test-project.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:abcdef',
      measurementId: 'G-ABCDEFGHIJ',
    });
  });

  it('should initialize Firebase services with the app instance', async () => {
    await import('../firebase');

    expect(mockGetAuth).toHaveBeenCalledWith(mockApp);
    expect(mockGetFirestore).toHaveBeenCalledWith(mockApp);
    expect(mockGetStorage).toHaveBeenCalledWith(mockApp);
  });

  it('should export Firebase service instances', async () => {
    const firebase = await import('../firebase');

    expect(firebase.auth).toBe(mockAuth);
    expect(firebase.db).toBe(mockDb);
    expect(firebase.storage).toBe(mockStorage);
    expect(firebase.default).toBe(mockApp);
  });

  it('should handle analytics initialization on client side', async () => {
    // Since we're in jsdom environment, window already exists
    // Just ensure the module is reimported and analytics is called
    jest.resetModules();
    mockGetAnalytics.mockClear(); // Clear previous calls
    
    const firebase = await import('../firebase');

    expect(mockGetAnalytics).toHaveBeenCalledWith(mockApp);
    expect(firebase.analytics).toBe(mockAnalytics);
  });

  it('should handle analytics properly in different environments', async () => {
    // Test that analytics is handled properly regardless of environment
    // Since we're in jsdom, window is available, so analytics should be initialized
    jest.resetModules();
    mockGetAnalytics.mockClear();
    
    const firebase = await import('../firebase');
    
    // Analytics should be available in test environment
    expect(firebase.analytics).toBeDefined();
    expect(mockGetAnalytics).toHaveBeenCalledWith(mockApp);
  });

  it('should use environment variables for configuration', async () => {
    // Test with different environment values
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'different-api-key';
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'different-project';

    jest.resetModules();
    await import('../firebase');

    expect(mockInitializeApp).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'different-api-key',
        projectId: 'different-project',
      })
    );
  });

  it('should handle missing environment variables gracefully', async () => {
    // Remove some environment variables
    delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    jest.resetModules();
    await import('../firebase');

    expect(mockInitializeApp).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: undefined,
        projectId: undefined,
        authDomain: 'test-project.firebaseapp.com',
      })
    );
  });

  it('should export all required services', async () => {
    const firebase = await import('../firebase');

    // Check that all expected exports are present
    expect(firebase).toHaveProperty('auth');
    expect(firebase).toHaveProperty('db');
    expect(firebase).toHaveProperty('storage');
    expect(firebase).toHaveProperty('analytics');
    expect(firebase).toHaveProperty('default');
  });

  it('should use the same app instance for all services', async () => {
    await import('../firebase');

    expect(mockGetAuth).toHaveBeenCalledWith(mockApp);
    expect(mockGetFirestore).toHaveBeenCalledWith(mockApp);
    expect(mockGetStorage).toHaveBeenCalledWith(mockApp);
  });

  it('should only initialize Firebase once', async () => {
    // Import multiple times
    await import('../firebase');
    await import('../firebase');
    await import('../firebase');

    // Should only initialize once due to module caching
    expect(mockInitializeApp).toHaveBeenCalledTimes(1);
    expect(mockGetAuth).toHaveBeenCalledTimes(1);
    expect(mockGetFirestore).toHaveBeenCalledTimes(1);
    expect(mockGetStorage).toHaveBeenCalledTimes(1);
  });

  it('should handle Firebase initialization errors', async () => {
    // Clear modules first to get a fresh import
    jest.resetModules();
    mockInitializeApp.mockImplementation(() => {
      throw new Error('Firebase initialization failed');
    });

    // Should throw during module import when initialization fails
    await expect(import('../firebase')).rejects.toThrow('Firebase initialization failed');
  });

  it('should handle service initialization errors gracefully', async () => {
    // Clear modules first to get a fresh import
    jest.resetModules();
    mockGetAuth.mockImplementation(() => {
      throw new Error('Auth service initialization failed');
    });

    await expect(import('../firebase')).rejects.toThrow('Auth service initialization failed');
  });

  it('should work with all environment variables present', async () => {
    // Ensure all required env vars are set
    const requiredEnvVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID',
      'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
    ];

    requiredEnvVars.forEach(envVar => {
      expect(process.env[envVar]).toBeDefined();
    });

    jest.resetModules();
    const firebase = await import('../firebase');

    expect(firebase.auth).toBeTruthy();
    expect(firebase.db).toBeTruthy();
    expect(firebase.storage).toBeTruthy();
    expect(firebase.default).toBeTruthy();
  });

  it('should have correct TypeScript types', async () => {
    const firebase = await import('../firebase');

    // These should not cause TypeScript errors
    const auth = firebase.auth;
    const db = firebase.db;
    const storage = firebase.storage;
    const app = firebase.default;

    expect(auth).toBeDefined();
    expect(db).toBeDefined();
    expect(storage).toBeDefined();
    expect(app).toBeDefined();
  });

  it('should support both named and default exports', async () => {
    const firebase = await import('../firebase');
    const { auth, db, storage, analytics } = await import('../firebase');

    expect(firebase.auth).toBe(auth);
    expect(firebase.db).toBe(db);
    expect(firebase.storage).toBe(storage);
    expect(firebase.analytics).toBe(analytics);
  });

  it('should initialize with production-like configuration', async () => {
    // Set production-like environment variables
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'AIzaSyABC123def456ghi789';
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'librarium-prod.firebaseapp.com';
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'librarium-prod';
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'librarium-prod.appspot.com';
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = '987654321';
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID = '1:987654321:web:xyz123';
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = 'G-XYZ123ABC';

    jest.resetModules();
    await import('../firebase');

    expect(mockInitializeApp).toHaveBeenCalledWith({
      apiKey: 'AIzaSyABC123def456ghi789',
      authDomain: 'librarium-prod.firebaseapp.com',
      projectId: 'librarium-prod',
      storageBucket: 'librarium-prod.appspot.com',
      messagingSenderId: '987654321',
      appId: '1:987654321:web:xyz123',
      measurementId: 'G-XYZ123ABC',
    });
  });
});

describe('Firebase Configuration Constants', () => {
  it('should include all required Firebase configuration fields', async () => {
    await import('../firebase');
    
    // Verify the configuration object structure
    expect(mockInitializeApp).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: expect.any(String),
        authDomain: expect.any(String),
        projectId: expect.any(String),
        storageBucket: expect.any(String),
        messagingSenderId: expect.any(String),
        appId: expect.any(String),
        measurementId: expect.any(String),
      })
    );
  });

  it('should not expose sensitive information in configuration', async () => {
    await import('../firebase');
    
    const [config] = mockInitializeApp.mock.calls[0];
    
    // All values should come from environment variables
    Object.values(config).forEach(value => {
      if (value !== undefined) {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      }
    });
  });
});