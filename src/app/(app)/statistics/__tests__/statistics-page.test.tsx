import { Timestamp } from 'firebase/firestore';
import { format, startOfMonth, subMonths } from 'date-fns';
import { Book, BookEvent } from '@/lib/models/models';
import { createGenreColorMapping } from '@/lib/utils/genre-colors';

/**
 * Test utilities for genre-based reading activity chart functionality
 * These tests validate the core data processing logic that powers the stacked area chart
 */

describe('Statistics Page - Genre Data Processing', () => {
  // Mock data for testing
  const mockBooks: Book[] = [
    {
      id: 'book-1',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      genre: 'Fiction',
      state: 'finished',
      progress: { currentPage: 180, totalPages: 180 },
      isOwned: true,
      addedAt: Timestamp.fromDate(new Date('2024-01-01')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-01')),
      startedAt: Timestamp.fromDate(new Date('2024-01-01')),
      finishedAt: Timestamp.fromDate(new Date('2024-01-15')),
    },
    {
      id: 'book-2',
      title: 'The Science of Everything',
      author: 'John Doe',
      genre: 'Non-Fiction',
      state: 'in_progress',
      progress: { currentPage: 120, totalPages: 300 },
      isOwned: true,
      addedAt: Timestamp.fromDate(new Date('2024-01-10')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-10')),
      startedAt: Timestamp.fromDate(new Date('2024-01-10')),
    },
    {
      id: 'book-3',
      title: 'Mystery Novel',
      author: 'Jane Smith',
      genre: 'Mystery',
      state: 'finished',
      progress: { currentPage: 250, totalPages: 250 },
      isOwned: true,
      addedAt: Timestamp.fromDate(new Date('2024-02-01')),
      updatedAt: Timestamp.fromDate(new Date('2024-02-01')),
      startedAt: Timestamp.fromDate(new Date('2024-02-01')),
      finishedAt: Timestamp.fromDate(new Date('2024-02-20')),
    },
    {
      id: 'book-4',
      title: 'Unknown Genre Book',
      author: 'Anonymous',
      state: 'finished',
      progress: { currentPage: 150, totalPages: 150 },
      isOwned: true,
      addedAt: Timestamp.fromDate(new Date('2024-02-15')),
      updatedAt: Timestamp.fromDate(new Date('2024-02-15')),
      startedAt: Timestamp.fromDate(new Date('2024-02-15')),
      finishedAt: Timestamp.fromDate(new Date('2024-02-25')),
    },
  ];

  // Use recent dates for more realistic testing
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 15);

  const mockEvents: BookEvent[] = [
    {
      id: 'event-1',
      bookId: 'book-1',
      userId: 'user-1',
      type: 'progress_update',
      timestamp: Timestamp.fromDate(new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 5)),
      data: { previousPage: 0, newPage: 50 },
    },
    {
      id: 'event-2',
      bookId: 'book-1',
      userId: 'user-1',
      type: 'progress_update',
      timestamp: Timestamp.fromDate(new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 10)),
      data: { previousPage: 50, newPage: 120 },
    },
    {
      id: 'event-3',
      bookId: 'book-1',
      userId: 'user-1',
      type: 'progress_update',
      timestamp: Timestamp.fromDate(new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 15)),
      data: { previousPage: 120, newPage: 180 },
    },
    {
      id: 'event-4',
      bookId: 'book-2',
      userId: 'user-1',
      type: 'progress_update',
      timestamp: Timestamp.fromDate(new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 20)),
      data: { previousPage: 0, newPage: 80 },
    },
    {
      id: 'event-5',
      bookId: 'book-2',
      userId: 'user-1',
      type: 'progress_update',
      timestamp: Timestamp.fromDate(new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 25)),
      data: { previousPage: 80, newPage: 120 },
    },
    {
      id: 'event-6',
      bookId: 'book-3',
      userId: 'user-1',
      type: 'progress_update',
      timestamp: Timestamp.fromDate(new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth(), 10)),
      data: { previousPage: 0, newPage: 150 },
    },
    {
      id: 'event-7',
      bookId: 'book-3',
      userId: 'user-1',
      type: 'progress_update',
      timestamp: Timestamp.fromDate(new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth(), 15)),
      data: { previousPage: 150, newPage: 250 },
    },
    {
      id: 'event-8',
      bookId: 'book-4',
      userId: 'user-1',
      type: 'progress_update',
      timestamp: Timestamp.fromDate(new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth(), 20)),
      data: { previousPage: 0, newPage: 150 },
    },
  ];

  describe('Genre-segmented historical data processing', () => {
    const processHistoricalDataByGenre = (events: BookEvent[], books: Book[]) => {
      if (!events.length || !books.length) return [];

      const progressEvents = events.filter(
        (event) => event.type === 'progress_update'
      );
      const last12Months = Array.from({ length: 12 }, (_, i) => {
        const date = subMonths(new Date(), 11 - i);
        return startOfMonth(date);
      });

      const resolveGenre = (bookId: string): string => {
        const book = books.find(b => b.id === bookId);
        return book?.genre || 'Unknown';
      };

      // First, collect all unique genres from all events
      const allGenres = new Set<string>();
      progressEvents.forEach(event => {
        const genre = resolveGenre(event.bookId);
        allGenres.add(genre);
      });

      const monthlyData = last12Months.map((month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

        const monthEvents = progressEvents.filter((event) => {
          const eventDate = event.timestamp.toDate();
          return eventDate >= monthStart && eventDate <= monthEnd;
        });

        const genrePages = monthEvents.reduce((acc, event) => {
          const genre = resolveGenre(event.bookId);
          const pagesRead = Math.max(0, (event.data.newPage || 0) - (event.data.previousPage || 0));
          acc[genre] = (acc[genre] || 0) + pagesRead;
          return acc;
        }, {} as Record<string, number>);

        // Ensure all genres have a value (0 if no data for that month)
        const monthData: Record<string, number | string> = {
          month: format(month, 'MMM yyyy'),
        };
        
        allGenres.forEach(genre => {
          monthData[genre] = genrePages[genre] || 0;
        });

        return monthData;
      });

      return monthlyData;
    };

    it('should process historical data by genre correctly', () => {
      const historicalData = processHistoricalDataByGenre(mockEvents, mockBooks);
      
      expect(historicalData).toHaveLength(12);
      
      // Check last month data (Fiction and Non-Fiction events)
      const lastMonthStr = format(lastMonth, 'MMM yyyy');
      const lastMonthData = historicalData.find(d => d.month === lastMonthStr);
      expect(lastMonthData).toBeDefined();
      expect(lastMonthData?.Fiction).toBe(180); // 50 + 70 + 60 pages from Fiction book
      expect(lastMonthData?.['Non-Fiction']).toBe(120); // 80 + 40 pages from Non-Fiction book
      expect(lastMonthData?.Mystery).toBe(0); // No Mystery events in last month, but should have 0 value
      expect(lastMonthData?.Unknown).toBe(0); // No Unknown events in last month, but should have 0 value
      
      // Check two months ago data (Mystery and Unknown events)
      const twoMonthsAgoStr = format(twoMonthsAgo, 'MMM yyyy');
      const twoMonthsAgoData = historicalData.find(d => d.month === twoMonthsAgoStr);
      expect(twoMonthsAgoData).toBeDefined();
      expect(twoMonthsAgoData?.Mystery).toBe(250); // 150 + 100 pages from Mystery book
      expect(twoMonthsAgoData?.Unknown).toBe(150); // 150 pages from Unknown genre book
      expect(twoMonthsAgoData?.Fiction).toBe(0); // No Fiction events two months ago, but should have 0 value
      expect(twoMonthsAgoData?.['Non-Fiction']).toBe(0); // No Non-Fiction events two months ago, but should have 0 value
    });

    it('should handle missing books by defaulting to Unknown genre', () => {
      const eventsWithMissingBook: BookEvent[] = [
        {
          id: 'event-missing',
          bookId: 'non-existent-book',
          userId: 'user-1',
          type: 'progress_update',
          timestamp: Timestamp.fromDate(lastMonth),
          data: { previousPage: 0, newPage: 100 },
        },
      ];

      const historicalData = processHistoricalDataByGenre(eventsWithMissingBook, mockBooks);
      const lastMonthStr = format(lastMonth, 'MMM yyyy');
      const lastMonthData = historicalData.find(d => d.month === lastMonthStr);
      
      expect(lastMonthData?.Unknown).toBe(100);
    });

    it('should handle negative page progress correctly', () => {
      const eventsWithNegativeProgress: BookEvent[] = [
        {
          id: 'event-negative',
          bookId: 'book-1',
          userId: 'user-1',
          type: 'progress_update',
          timestamp: Timestamp.fromDate(lastMonth),
          data: { previousPage: 100, newPage: 50 }, // Negative progress
        },
      ];

      const historicalData = processHistoricalDataByGenre(eventsWithNegativeProgress, mockBooks);
      const lastMonthStr = format(lastMonth, 'MMM yyyy');
      const lastMonthData = historicalData.find(d => d.month === lastMonthStr);
      
      // Should clamp negative progress to 0
      expect(lastMonthData?.Fiction).toBe(0);
    });

    it('should return empty array when no events or books provided', () => {
      expect(processHistoricalDataByGenre([], mockBooks)).toEqual([]);
      expect(processHistoricalDataByGenre(mockEvents, [])).toEqual([]);
      expect(processHistoricalDataByGenre([], [])).toEqual([]);
    });

    it('should only process progress_update events', () => {
      const mixedEvents: BookEvent[] = [
        ...mockEvents.slice(0, 2), // progress_update events
        {
          id: 'event-state',
          bookId: 'book-1',
          userId: 'user-1',
          type: 'state_change',
          timestamp: Timestamp.fromDate(lastMonth),
          data: { previousState: 'not_started', newState: 'in_progress' },
        },
      ];

      const historicalData = processHistoricalDataByGenre(mixedEvents, mockBooks);
      const lastMonthStr = format(lastMonth, 'MMM yyyy');
      const lastMonthData = historicalData.find(d => d.month === lastMonthStr);
      
      // Should only count progress_update events (50 + 70 = 120)
      expect(lastMonthData?.Fiction).toBe(120);
    });
  });

  describe('Genre color consistency', () => {
    it('should use the same color mapping for both pie chart and area chart', () => {
      const genres = ['Fiction', 'Non-Fiction', 'Mystery', 'Unknown'];
      const colorMap = createGenreColorMapping(genres);

      // Test that colors are consistent
      expect(colorMap.Fiction).toBeDefined();
      expect(colorMap['Non-Fiction']).toBeDefined();
      expect(colorMap.Mystery).toBeDefined();
      expect(colorMap.Unknown).toBe('oklch(0.85 0.01 240)'); // Special Unknown color

      // Test that the same genres get the same colors in multiple calls
      const colorMap2 = createGenreColorMapping(genres);
      expect(colorMap).toEqual(colorMap2);
    });

    it('should handle genre extraction from historical data', () => {
      const historicalData = [
        { month: 'Jan 2024', Fiction: 120, 'Non-Fiction': 80 },
        { month: 'Feb 2024', Mystery: 150, Unknown: 50 },
      ];

      // Extract genres from historical data
      const allGenres = new Set<string>();
      historicalData.forEach(monthData => {
        Object.keys(monthData).forEach(key => {
          if (key !== 'month') {
            allGenres.add(key);
          }
        });
      });

      const availableGenres = Array.from(allGenres);
      expect(availableGenres).toContain('Fiction');
      expect(availableGenres).toContain('Non-Fiction');
      expect(availableGenres).toContain('Mystery');
      expect(availableGenres).toContain('Unknown');
      expect(availableGenres).toHaveLength(4);

      // Test color mapping
      const genreColorMap = createGenreColorMapping(availableGenres);
      expect(Object.keys(genreColorMap)).toHaveLength(4);
      expect(genreColorMap.Unknown).toBe('oklch(0.85 0.01 240)');
    });
  });

  describe('Chart integration', () => {
    it('should prepare data structure compatible with Recharts stacked areas', () => {
      const historicalData = [
        { month: 'Jan 2024', Fiction: 120, 'Non-Fiction': 80 },
        { month: 'Feb 2024', Mystery: 150, Unknown: 50 },
        { month: 'Mar 2024', Fiction: 90, Mystery: 70, Unknown: 30 },
      ];

      // Simulate chart data processing
      const allGenres = new Set<string>();
      historicalData.forEach(monthData => {
        Object.keys(monthData).forEach(key => {
          if (key !== 'month') {
            allGenres.add(key);
          }
        });
      });

      const availableGenres = Array.from(allGenres);
      const genreColorMap = createGenreColorMapping(availableGenres);

      // Validate structure for Recharts
      expect(historicalData[0]).toHaveProperty('month');
      expect(historicalData[0]).toHaveProperty('Fiction');
      expect(historicalData[0]).toHaveProperty('Non-Fiction');

      // Validate color mapping
      availableGenres.forEach(genre => {
        expect(genreColorMap[genre]).toBeDefined();
        expect(typeof genreColorMap[genre]).toBe('string');
      });

      // Validate that each genre would have proper color for Area component
      availableGenres.forEach(genre => {
        const color = genreColorMap[genre];
        expect(color).toMatch(/^oklch\(/); // Should be oklch color format
      });
    });
  });
});