import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { initializeApp } from "firebase/app";
import { Book, UserProfile, ActivityItem } from "@/lib/models/models";

// Firebase config from existing gemini setup
const firebaseConfig = {
  apiKey: "AIzaSyBXfzoKD3X9eJqrJiRNU29cR2NJVVuXdLc",
  authDomain: "librarium-js.firebaseapp.com",
  projectId: "librarium-js",
  storageBucket: "librarium-js.firebasestorage.app",
  messagingSenderId: "136196993705",
  appId: "1:136196993705:web:a40bad12df5e229833efb8",
  measurementId: "G-5NF3ZQ4221",
};

const app = initializeApp(firebaseConfig);
const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash-lite" });

interface PersonalizedMessageData {
  userProfile: UserProfile;
  books: Book[];
  recentActivity: ActivityItem[];
  stats: {
    totalBooks: number;
    finishedBooks: number;
    currentlyReading: number;
    readingStreak: number;
    totalPagesRead: number;
  };
}

interface PersonalizedMessage {
  content: string;
  timestamp: Date;
  cacheKey: string;
}

// Cache for storing messages to avoid excessive API calls
const messageCache = new Map<string, PersonalizedMessage>();

// Fallback messages for when AI is unavailable
const fallbackMessages = [
  "Keep up the great reading! Every page brings new discoveries.",
  "Your reading journey is inspiring. What story will you dive into next?",
  "Books are the gateway to endless worlds. Happy reading!",
  "Each book you read adds to your incredible literary adventure.",
  "Reading is not just a hobby, it's a superpower. Keep going!",
];

const createCacheKey = (data: PersonalizedMessageData): string => {
  // Create a cache key based on key data points
  const keyData = {
    userId: data.userProfile.id,
    totalBooks: data.stats.totalBooks,
    finishedBooks: data.stats.finishedBooks,
    currentlyReading: data.stats.currentlyReading,
    readingStreak: data.stats.readingStreak,
    recentActivityCount: data.recentActivity.length,
    lastActivity: data.recentActivity[0]?.timestamp?.toISOString() || '',
  };
  
  return btoa(JSON.stringify(keyData));
};

const shouldRefreshMessage = (cachedMessage: PersonalizedMessage): boolean => {
  const cacheAge = Date.now() - cachedMessage.timestamp.getTime();
  const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours
  return cacheAge > CACHE_DURATION;
};

const buildPrompt = (data: PersonalizedMessageData): string => {
  const { userProfile, books, stats, recentActivity } = data;
  
  const currentlyReadingBooks = books.filter(book => book.state === 'in_progress');
  const recentlyFinished = books
    .filter(book => book.state === 'finished')
    .sort((a, b) => (b.finishedAt?.toMillis() || 0) - (a.finishedAt?.toMillis() || 0))
    .slice(0, 3);
  
  const genres = books
    .filter(book => book.genre)
    .map(book => book.genre)
    .filter((genre, index, arr) => arr.indexOf(genre) === index)
    .slice(0, 5);

  return `You are Librarium's AI reading companion. Generate a personalized, encouraging message for ${userProfile.displayName} based on their reading data.

Reading Statistics:
- Total books in library: ${stats.totalBooks}
- Books finished: ${stats.finishedBooks}
- Currently reading: ${stats.currentlyReading}
- Reading streak: ${stats.readingStreak} days
- Total pages read: ${stats.totalPagesRead}

Currently Reading:
${currentlyReadingBooks.map(book => `- "${book.title}" by ${book.author} (${Math.round((book.progress.currentPage / book.progress.totalPages) * 100)}% complete)`).join('\n') || 'No books currently being read'}

Recently Finished:
${recentlyFinished.map(book => `- "${book.title}" by ${book.author}${book.rating ? ` (rated ${book.rating}/5 stars)` : ''}`).join('\n') || 'No books finished recently'}

Favorite Genres: ${genres.join(', ') || 'Not yet determined'}

Recent Activity: ${recentActivity.slice(0, 3).map(activity => activity.type).join(', ') || 'No recent activity'}

Generate a warm, encouraging message (50-80 words) that:
1. Acknowledges their reading progress or achievements
2. Provides gentle motivation to continue reading
3. References specific aspects of their reading habits when relevant
4. Maintains an upbeat, supportive tone
5. Feels personal and tailored to their data

Keep it conversational and inspiring, avoiding generic advice. Focus on celebrating their reading journey.`;
};

export const generatePersonalizedMessage = async (
  data: PersonalizedMessageData
): Promise<string> => {
  try {
    const cacheKey = createCacheKey(data);
    const cachedMessage = messageCache.get(cacheKey);
    
    // Return cached message if it's still fresh
    if (cachedMessage && !shouldRefreshMessage(cachedMessage)) {
      return cachedMessage.content;
    }
    
    const prompt = buildPrompt(data);
    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();
    
    // Cache the new message
    messageCache.set(cacheKey, {
      content,
      timestamp: new Date(),
      cacheKey,
    });
    
    return content;
  } catch (error) {
    console.error('Failed to generate personalized message:', error);
    
    // Return fallback message based on user data
    const { stats } = data;
    
    if (stats.readingStreak > 7) {
      return `Amazing ${stats.readingStreak}-day reading streak! Your dedication to reading is truly inspiring. Keep up this fantastic momentum!`;
    }
    
    if (stats.currentlyReading > 0) {
      return `You're currently reading ${stats.currentlyReading} book${stats.currentlyReading > 1 ? 's' : ''}! That's wonderful progress. Every page brings new discoveries.`;
    }
    
    if (stats.finishedBooks > 0) {
      return `Congratulations on finishing ${stats.finishedBooks} book${stats.finishedBooks > 1 ? 's' : ''}! Your reading journey is building something beautiful.`;
    }
    
    // Default fallback
    return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
  }
};

// Service export with result type pattern
export const personalizedMessageService = {
  generateMessage: generatePersonalizedMessage,
};