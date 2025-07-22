import {
  mockTimestamp,
  mockFirestore,
  mockAuth,
  mockFirebaseApp,
  mockStorage,
  resetFirebaseMocks,
  createMockUser,
  createMockUserProfile,
  createMockBook,
  testDataPresets,
} from '../firebase-mock';
import { User } from 'firebase/auth';
import { Book, UserProfile } from '@/lib/models/models';

describe('mockTimestamp', () => {
  it('should have correct structure', () => {
    expect(mockTimestamp).toHaveProperty('seconds');
    expect(mockTimestamp).toHaveProperty('nanoseconds');
    expect(mockTimestamp).toHaveProperty('toDate');
    expect(typeof mockTimestamp.toDate).toBe('function');
  });

  it('should return consistent date', () => {
    const date = mockTimestamp.toDate();
    expect(date).toBeInstanceOf(Date);
    expect(date.getTime()).toBe(1234567890000);
  });

  it('should have correct timestamp values', () => {
    expect(mockTimestamp.seconds).toBe(1234567890);
    expect(mockTimestamp.nanoseconds).toBe(0);
  });
});

describe('mockFirestore', () => {
  beforeEach(() => {
    resetFirebaseMocks();
  });

  it('should have all required Firestore functions', () => {
    const requiredMethods = [
      'collection',
      'doc',
      'addDoc',
      'updateDoc',
      'deleteDoc',
      'getDocs',
      'getDoc',
      'query',
      'where',
      'orderBy',
      'limit',
      'onSnapshot',
      'writeBatch',
      'clearData',
      'seedData',
    ];

    requiredMethods.forEach(method => {
      expect(mockFirestore).toHaveProperty(method);
      expect(typeof mockFirestore[method]).toBe('function');
    });
  });

  it('should have Timestamp mock', () => {
    expect(mockFirestore.Timestamp).toBeDefined();
    expect(mockFirestore.Timestamp.now).toBeDefined();
    expect(typeof mockFirestore.Timestamp.now).toBe('function');
  });

  it('should return mockTimestamp from Timestamp.now()', () => {
    const timestamp = mockFirestore.Timestamp.now();
    expect(timestamp).toBe(mockTimestamp);
  });

  it('should provide writeBatch with all required methods', () => {
    const batch = mockFirestore.writeBatch();
    
    expect(batch).toHaveProperty('set');
    expect(batch).toHaveProperty('update');
    expect(batch).toHaveProperty('delete');
    expect(batch).toHaveProperty('commit');
    
    expect(typeof batch.set).toBe('function');
    expect(typeof batch.update).toBe('function');
    expect(typeof batch.delete).toBe('function');
    expect(typeof batch.commit).toBe('function');
  });

  it('should be mockable with jest functions', () => {
    mockFirestore.collection.mockReturnValue('mock-collection');
    const result = mockFirestore.collection('test');
    
    expect(result).toBe('mock-collection');
    expect(mockFirestore.collection).toHaveBeenCalledWith('test');
  });

  it('should support clearData and seedData for testing', () => {
    expect(mockFirestore.clearData).toBeDefined();
    expect(mockFirestore.seedData).toBeDefined();
    
    // Should not throw when called
    expect(() => mockFirestore.clearData()).not.toThrow();
    expect(() => mockFirestore.seedData('test', [])).not.toThrow();
  });
});

describe('mockAuth', () => {
  it('should have all required Auth functions', () => {
    const requiredMethods = [
      'getAuth',
      'onAuthStateChanged',
      'signInWithPopup',
      'signOut',
      'GoogleAuthProvider',
    ];

    requiredMethods.forEach(method => {
      expect(mockAuth).toHaveProperty(method);
      expect(typeof mockAuth[method]).toBe('function');
    });
  });

  it('should be mockable with jest functions', () => {
    mockAuth.getAuth.mockReturnValue({ currentUser: null });
    const auth = mockAuth.getAuth();
    
    expect(auth.currentUser).toBeNull();
    expect(mockAuth.getAuth).toHaveBeenCalled();
  });
});

describe('mockFirebaseApp', () => {
  it('should have all required App functions', () => {
    const requiredMethods = [
      'initializeApp',
      'getApps',
      'getApp',
    ];

    requiredMethods.forEach(method => {
      expect(mockFirebaseApp).toHaveProperty(method);
      expect(typeof mockFirebaseApp[method]).toBe('function');
    });
  });

  it('should return empty array for getApps by default', () => {
    const apps = mockFirebaseApp.getApps();
    expect(Array.isArray(apps)).toBe(true);
    expect(apps).toEqual([]);
  });
});

describe('mockStorage', () => {
  it('should have all required Storage functions', () => {
    const requiredMethods = [
      'getStorage',
      'ref',
      'uploadBytes',
      'getDownloadURL',
    ];

    requiredMethods.forEach(method => {
      expect(mockStorage).toHaveProperty(method);
      expect(typeof mockStorage[method]).toBe('function');
    });
  });

  it('should be mockable with jest functions', () => {
    mockStorage.getStorage.mockReturnValue({ bucket: 'test' });
    const storage = mockStorage.getStorage();
    
    expect(storage.bucket).toBe('test');
    expect(mockStorage.getStorage).toHaveBeenCalled();
  });
});

describe('resetFirebaseMocks', () => {
  it('should clear all mock function calls', () => {
    // Call some mock functions
    mockFirestore.collection('test');
    mockAuth.getAuth();
    mockFirebaseApp.getApps();
    mockStorage.getStorage();

    // Verify they were called
    expect(mockFirestore.collection).toHaveBeenCalled();
    expect(mockAuth.getAuth).toHaveBeenCalled();
    expect(mockFirebaseApp.getApps).toHaveBeenCalled();
    expect(mockStorage.getStorage).toHaveBeenCalled();

    // Reset mocks
    resetFirebaseMocks();

    // Verify they were cleared
    expect(mockFirestore.collection).not.toHaveBeenCalled();
    expect(mockAuth.getAuth).not.toHaveBeenCalled();
    expect(mockFirebaseApp.getApps).not.toHaveBeenCalled();
    expect(mockStorage.getStorage).not.toHaveBeenCalled();
  });

  it('should clear writeBatch and Timestamp mocks', () => {
    mockFirestore.writeBatch();
    mockFirestore.Timestamp.now();

    expect(mockFirestore.writeBatch).toHaveBeenCalled();
    expect(mockFirestore.Timestamp.now).toHaveBeenCalled();

    resetFirebaseMocks();

    expect(mockFirestore.writeBatch).not.toHaveBeenCalled();
    expect(mockFirestore.Timestamp.now).not.toHaveBeenCalled();
  });
});

describe('createMockUser', () => {
  it('should create a valid User object with defaults', () => {
    const user = createMockUser();

    expect(user).toHaveProperty('uid');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('displayName');
    expect(user).toHaveProperty('photoURL');
    expect(user).toHaveProperty('emailVerified');
    expect(user).toHaveProperty('isAnonymous');
    expect(user).toHaveProperty('metadata');
    expect(user).toHaveProperty('providerData');
    expect(user).toHaveProperty('refreshToken');
    expect(user).toHaveProperty('tenantId');

    expect(typeof user.delete).toBe('function');
    expect(typeof user.getIdToken).toBe('function');
    expect(typeof user.getIdTokenResult).toBe('function');
    expect(typeof user.reload).toBe('function');
    expect(typeof user.toJSON).toBe('function');
  });

  it('should use default values', () => {
    const user = createMockUser();

    expect(user.uid).toBe('test-user-id');
    expect(user.email).toBe('test@example.com');
    expect(user.displayName).toBe('Test User');
    expect(user.emailVerified).toBe(true);
    expect(user.isAnonymous).toBe(false);
  });

  it('should accept overrides', () => {
    const overrides: Partial<User> = {
      uid: 'custom-uid',
      email: 'custom@example.com',
      displayName: 'Custom User',
      emailVerified: false,
    };

    const user = createMockUser(overrides);

    expect(user.uid).toBe('custom-uid');
    expect(user.email).toBe('custom@example.com');
    expect(user.displayName).toBe('Custom User');
    expect(user.emailVerified).toBe(false);
    expect(user.isAnonymous).toBe(false); // Default value preserved
  });

  it('should have proper metadata structure', () => {
    const user = createMockUser();

    expect(user.metadata).toBeDefined();
    expect(user.metadata.creationTime).toBeDefined();
    expect(user.metadata.lastSignInTime).toBeDefined();
  });

  it('should have empty provider data by default', () => {
    const user = createMockUser();

    expect(Array.isArray(user.providerData)).toBe(true);
    expect(user.providerData.length).toBe(0);
  });
});

describe('createMockUserProfile', () => {
  it('should create a valid UserProfile object', () => {
    const profile = createMockUserProfile();

    expect(profile).toHaveProperty('id');
    expect(profile).toHaveProperty('displayName');
    expect(profile).toHaveProperty('email');
    expect(profile).toHaveProperty('photoURL');
    expect(profile).toHaveProperty('createdAt');
    expect(profile).toHaveProperty('updatedAt');
    expect(profile).toHaveProperty('emailVerified');
    expect(profile).toHaveProperty('lastSignInTime');
    expect(profile).toHaveProperty('totalBooksRead');
    expect(profile).toHaveProperty('currentlyReading');
    expect(profile).toHaveProperty('booksInLibrary');
  });

  it('should use default values', () => {
    const profile = createMockUserProfile();

    expect(profile.id).toBe('test-user-id');
    expect(profile.displayName).toBe('Test User');
    expect(profile.email).toBe('test@example.com');
    expect(profile.emailVerified).toBe(true);
    expect(profile.totalBooksRead).toBe(0);
    expect(profile.currentlyReading).toBe(0);
    expect(profile.booksInLibrary).toBe(0);
    expect(profile.createdAt).toBe(mockTimestamp);
    expect(profile.updatedAt).toBe(mockTimestamp);
  });

  it('should accept overrides', () => {
    const overrides: Partial<UserProfile> = {
      id: 'custom-user-id',
      displayName: 'Custom User',
      totalBooksRead: 5,
      currentlyReading: 2,
    };

    const profile = createMockUserProfile(overrides);

    expect(profile.id).toBe('custom-user-id');
    expect(profile.displayName).toBe('Custom User');
    expect(profile.totalBooksRead).toBe(5);
    expect(profile.currentlyReading).toBe(2);
    expect(profile.email).toBe('test@example.com'); // Default preserved
  });
});

describe('createMockBook', () => {
  it('should create a valid Book object', () => {
    const book = createMockBook();

    expect(book).toHaveProperty('id');
    expect(book).toHaveProperty('title');
    expect(book).toHaveProperty('author');
    expect(book).toHaveProperty('state');
    expect(book).toHaveProperty('isOwned');
    expect(book).toHaveProperty('progress');
    expect(book).toHaveProperty('addedAt');
    expect(book).toHaveProperty('updatedAt');
  });

  it('should use default values', () => {
    const book = createMockBook();

    expect(book.id).toBe('test-book-id');
    expect(book.title).toBe('Test Book');
    expect(book.author).toBe('Test Author');
    expect(book.state).toBe('not_started');
    expect(book.isOwned).toBe(true);
    expect(book.progress.currentPage).toBe(0);
    expect(book.progress.totalPages).toBe(100);
    expect(book.addedAt).toBe(mockTimestamp);
    expect(book.updatedAt).toBe(mockTimestamp);
  });

  it('should accept overrides', () => {
    const overrides: Partial<Book> = {
      id: 'custom-book-id',
      title: 'Custom Book',
      state: 'in_progress',
      progress: { currentPage: 50, totalPages: 200 },
    };

    const book = createMockBook(overrides);

    expect(book.id).toBe('custom-book-id');
    expect(book.title).toBe('Custom Book');
    expect(book.state).toBe('in_progress');
    expect(book.progress.currentPage).toBe(50);
    expect(book.progress.totalPages).toBe(200);
    expect(book.author).toBe('Test Author'); // Default preserved
  });

  it('should create books with proper progress structure', () => {
    const book = createMockBook();

    expect(book.progress).toBeDefined();
    expect(typeof book.progress.currentPage).toBe('number');
    expect(typeof book.progress.totalPages).toBe('number');
  });
});

describe('testDataPresets', () => {
  it('should have all required presets', () => {
    const requiredPresets = ['empty', 'small', 'large', 'mixed'];
    
    requiredPresets.forEach(preset => {
      expect(testDataPresets).toHaveProperty(preset);
      expect(testDataPresets[preset]).toHaveProperty('user');
      expect(testDataPresets[preset]).toHaveProperty('books');
      expect(testDataPresets[preset]).toHaveProperty('events');
    });
  });

  it('should have empty preset with no data', () => {
    const empty = testDataPresets.empty;

    expect(empty.books).toEqual([]);
    expect(empty.events).toEqual([]);
    expect(empty.user.totalBooksRead).toBe(0);
    expect(empty.user.currentlyReading).toBe(0);
    expect(empty.user.booksInLibrary).toBe(0);
  });

  it('should have small preset with appropriate data', () => {
    const small = testDataPresets.small;

    expect(small.books.length).toBe(3);
    expect(small.user.totalBooksRead).toBe(2);
    expect(small.user.currentlyReading).toBe(1);
    expect(small.user.booksInLibrary).toBe(3);

    // Verify book states
    const states = small.books.map(book => book.state);
    expect(states).toContain('finished');
    expect(states).toContain('in_progress');
    expect(states).toContain('not_started');
  });

  it('should have large preset with more data', () => {
    const large = testDataPresets.large;

    expect(large.books.length).toBe(15);
    expect(large.user.totalBooksRead).toBe(10);
    expect(large.user.currentlyReading).toBe(3);
    expect(large.user.booksInLibrary).toBe(15);

    // Verify distribution of book states
    const states = large.books.map(book => book.state);
    const inProgressCount = states.filter(state => state === 'in_progress').length;
    const finishedCount = states.filter(state => state === 'finished').length;
    const notStartedCount = states.filter(state => state === 'not_started').length;

    expect(inProgressCount).toBe(3);
    expect(finishedCount).toBe(7); // Books 3-9 (7 books)
    expect(notStartedCount).toBe(5); // Books 10-14 (5 books)
  });

  it('should have mixed preset with varied data', () => {
    const mixed = testDataPresets.mixed;

    expect(mixed.books.length).toBe(3);
    expect(mixed.user.totalBooksRead).toBe(5);
    expect(mixed.user.currentlyReading).toBe(2);
    expect(mixed.user.booksInLibrary).toBe(8);

    // Verify books have genres
    const genres = mixed.books.map(book => book.genre).filter(Boolean);
    expect(genres.length).toBe(3);
    expect(genres).toContain('Fiction');
    expect(genres).toContain('Non-Fiction');
    expect(genres).toContain('Mystery');
  });

  it('should have consistent user profile structures', () => {
    Object.values(testDataPresets).forEach(preset => {
      expect(preset.user).toHaveProperty('id');
      expect(preset.user).toHaveProperty('displayName');
      expect(preset.user).toHaveProperty('email');
      expect(preset.user).toHaveProperty('totalBooksRead');
      expect(preset.user).toHaveProperty('currentlyReading');
      expect(preset.user).toHaveProperty('booksInLibrary');
    });
  });

  it('should have books with unique IDs within each preset', () => {
    Object.values(testDataPresets).forEach(preset => {
      const ids = preset.books.map(book => book.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  it('should have proper book state distribution in large preset', () => {
    const large = testDataPresets.large;
    const stateCount = {
      not_started: 0,
      in_progress: 0,
      finished: 0,
    };

    large.books.forEach(book => {
      stateCount[book.state]++;
    });

    // Based on the logic in the preset creation
    expect(stateCount.in_progress).toBe(3); // First 3 books
    expect(stateCount.finished).toBe(7); // Next 7 books (3-9)
    expect(stateCount.not_started).toBe(5); // Last 5 books (10-14)
  });
});