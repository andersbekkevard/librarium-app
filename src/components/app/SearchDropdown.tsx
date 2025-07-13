"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { BRAND_COLORS, READING_STATE_COLORS } from "@/lib/design/colors";
import { Book } from "@/lib/models/models";
import { useBooksContext } from "@/lib/providers/BooksProvider";
import { cn } from "@/lib/utils/utils";
import { BookOpen, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

interface SearchDropdownProps {
  placeholder?: string;
  className?: string;
}

// Single state enum to prevent timing issues
type SearchState = "idle" | "searching" | "completed" | "error";

interface SearchData {
  state: SearchState;
  query: string;
  results: Book[];
  error?: string;
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  placeholder = "Search books, authors, or genres...",
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Single atomic state for search
  const [searchData, setSearchData] = useState<SearchData>({
    state: "idle",
    query: "",
    results: [],
  });

  // Cache for completed searches
  const [searchCache, setSearchCache] = useState<Record<string, Book[]>>({});

  const { searchBooks, books } = useBooksContext();
  const router = useRouter();

  // Ref to track current search to avoid race conditions
  const currentSearchRef = useRef<string>("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Local search function
  const performLocalSearch = useCallback(
    (query: string): Book[] => {
      if (!query.trim()) return [];

      const searchTerm = query.toLowerCase();
      return books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm) ||
          book.author.toLowerCase().includes(searchTerm) ||
          book.genre?.toLowerCase().includes(searchTerm) ||
          book.description?.toLowerCase().includes(searchTerm)
      );
    },
    [books]
  );

  // Main search function with forced re-renders
  const performSearch = useCallback(
    async (query: string) => {
      const trimmedQuery = query.trim();

      console.log("🔍 Starting search for:", trimmedQuery);

      // Cancel any previous search
      if (abortControllerRef.current) {
        console.log("🚫 Canceling previous search");
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      // Check cache first
      if (searchCache[trimmedQuery]) {
        console.log(
          "✅ Using cached results for:",
          trimmedQuery,
          "Results:",
          searchCache[trimmedQuery].length
        );

        // FORCED RE-RENDER: Use flushSync to ensure immediate DOM update
        flushSync(() => {
          setSearchData({
            state: "completed",
            query: trimmedQuery,
            results: searchCache[trimmedQuery],
          });
        });
        console.log("💪 Forced re-render for cached results");
        return;
      }

      // Create new AbortController for this search
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Start search - FORCED RE-RENDER
      flushSync(() => {
        setSearchData({
          state: "searching",
          query: trimmedQuery,
          results: [],
        });
      });
      console.log("💪 Forced re-render for searching state");

      currentSearchRef.current = trimmedQuery;

      try {
        // Try service search first
        console.log("🌐 Calling service search for:", trimmedQuery);
        const result = await searchBooks(trimmedQuery, 8);

        // Check if this search was aborted
        if (abortController.signal.aborted) {
          console.log("🚫 Search was aborted for:", trimmedQuery);
          return;
        }

        // Check if this search is still current
        if (currentSearchRef.current !== trimmedQuery) {
          console.log(
            "❌ Search cancelled, query changed from",
            trimmedQuery,
            "to",
            currentSearchRef.current
          );
          return;
        }

        let results: Book[] = [];
        if (result.success) {
          results = result.data || [];
          console.log(
            "✅ Service search successful:",
            results.length,
            "results"
          );
        } else {
          console.log(
            "⚠️ Service search failed, using local search:",
            result.error
          );
          results = performLocalSearch(trimmedQuery);
          console.log("🏠 Local search found:", results.length, "results");
        }

        // FORCED RE-RENDER: Critical update with immediate DOM sync
        flushSync(() => {
          setSearchData({
            state: "completed",
            query: trimmedQuery,
            results: results,
          });
        });
        console.log(
          "💪 Forced re-render for completed results:",
          results.length
        );

        // Update cache after state update
        setSearchCache((prev) => ({ ...prev, [trimmedQuery]: results }));
        console.log("💾 Cached results for:", trimmedQuery);
      } catch (error: any) {
        // Check if error is due to cancellation
        if (error.name === "AbortError" || abortController.signal.aborted) {
          console.log("🚫 Search aborted for:", trimmedQuery);
          return;
        }

        console.error("💥 Search error:", error);

        // Check if search is still current
        if (currentSearchRef.current !== trimmedQuery) {
          console.log("❌ Error handling cancelled, query changed");
          return;
        }

        // Fallback to local search - FORCED RE-RENDER
        const results = performLocalSearch(trimmedQuery);
        console.log(
          "🔄 Fallback local search found:",
          results.length,
          "results"
        );

        flushSync(() => {
          setSearchData({
            state: "completed",
            query: trimmedQuery,
            results: results,
          });
        });
        console.log("💪 Forced re-render for fallback results");

        setSearchCache((prev) => ({ ...prev, [trimmedQuery]: results }));
      } finally {
        // Clear the search progress and abort controller if they're still ours
        if (currentSearchRef.current === trimmedQuery) {
          currentSearchRef.current = "";
        }
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      }
    },
    [searchBooks, performLocalSearch, searchCache]
  );

  // Handle input changes with debouncing
  const handleInputChange = useCallback(
    (value: string) => {
      console.log("📝 Input changed to:", value);
      setSearchQuery(value);
      setIsOpen(value.length > 0);

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      const trimmedValue = value.trim();

      if (!trimmedValue) {
        console.log("🧹 Clearing search state (empty input)");
        // Cancel any in-flight search
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
        // Clear search state when input is empty - FORCED RE-RENDER
        flushSync(() => {
          setSearchData({
            state: "idle",
            query: "",
            results: [],
          });
        });
        currentSearchRef.current = "";
        return;
      }

      // Check cache immediately for instant results
      if (searchCache[trimmedValue]) {
        console.log("⚡ Instant cache hit for:", trimmedValue);
        // FORCED RE-RENDER: Instant results from cache
        flushSync(() => {
          setSearchData({
            state: "completed",
            query: trimmedValue,
            results: searchCache[trimmedValue],
          });
        });
        console.log("💪 Forced re-render for instant cache hit");
        return;
      }

      // Start search after debounce
      console.log("⏱️ Starting 300ms debounce for:", trimmedValue);
      searchTimeoutRef.current = setTimeout(() => {
        console.log("🚀 Debounce complete, starting search for:", trimmedValue);
        performSearch(trimmedValue);
      }, 300);
    },
    [searchCache, performSearch]
  );

  // Cleanup timeout and abort controller on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const handleBookSelect = useCallback(
    (book: Book) => {
      console.log("📖 Book selected:", book.title);
      router.push(`/books/${book.id}`);
      setIsOpen(false);
      setSearchQuery("");
      setSearchData({ state: "idle", query: "", results: [] });
    },
    [router]
  );

  const handleAddBookSelect = useCallback(() => {
    console.log("➕ Add book selected");
    const searchParams = new URLSearchParams();
    if (searchQuery.trim()) {
      searchParams.set("q", searchQuery.trim());
    }
    const url = `/add-books${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    router.push(url);
    setIsOpen(false);
    setSearchQuery("");
    setSearchData({ state: "idle", query: "", results: [] });
  }, [router, searchQuery]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      console.log("⎋ Escape pressed, closing dropdown");
      // Cancel any in-flight search
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      setIsOpen(false);
      setSearchQuery("");
      setSearchData({ state: "idle", query: "", results: [] });
      currentSearchRef.current = "";
    }
  }, []);

  const formatAuthors = useCallback((author: string) => {
    return author.length > 30 ? `${author.substring(0, 30)}...` : author;
  }, []);

  const formatTitle = useCallback((title: string) => {
    return title.length > 40 ? `${title.substring(0, 40)}...` : title;
  }, []);

  // Get reading state colors
  const getReadingStateClasses = useCallback((state: Book["state"]) => {
    switch (state) {
      case "finished":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in_progress":
        return cn(
          READING_STATE_COLORS.in_progress.bg,
          READING_STATE_COLORS.in_progress.text
        );
      case "not_started":
        return cn(
          READING_STATE_COLORS.not_started.bg,
          READING_STATE_COLORS.not_started.text
        );
      default:
        return cn(
          READING_STATE_COLORS.not_started.bg,
          READING_STATE_COLORS.not_started.text
        );
    }
  }, []);

  // Debug logging for state changes
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🔄 SearchDropdown State Update:");
      console.log("  Query:", searchQuery);
      console.log("  Search State:", searchData.state);
      console.log("  Search Query:", searchData.query);
      console.log("  Results Count:", searchData.results.length);
      console.log("  Is Open:", isOpen);
      console.log("  Cache Keys:", Object.keys(searchCache));
      console.log("  Will render spinner:", searchData.state === "searching");
      console.log("  Will render results:", searchData.state === "completed");
    }
  }, [searchQuery, searchData, isOpen, searchCache]);

  console.log(
    "🎨 RENDER - State:",
    searchData.state,
    "Results:",
    searchData.results.length,
    "Open:",
    isOpen
  );

  return (
    <div className={cn("relative w-full", className)}>
      <Command
        onKeyDown={handleKeyDown}
        className="rounded-lg border border-border bg-popover shadow-md"
      >
        <CommandInput
          placeholder={placeholder}
          value={searchQuery}
          onValueChange={handleInputChange}
          className="h-10"
        />

        {isOpen && (
          <CommandList className="absolute top-full left-0 right-0 max-h-[400px] overflow-y-auto border border-border bg-popover shadow-lg rounded-b-lg z-50 mt-1">
            {/* Show spinner while searching */}
            {searchData.state === "searching" && (
              <div className="flex items-center justify-center p-6">
                <div
                  className={cn(
                    "animate-spin rounded-full h-5 w-5 border-b-2",
                    BRAND_COLORS.primary.border
                  )}
                ></div>
                <span className="ml-3 text-sm text-muted-foreground">
                  Searching your library...
                </span>
              </div>
            )}

            {/* Show results only when search is completed */}
            {searchData.state === "completed" && (
              <>
                {searchData.results.length === 0 ? (
                  <CommandEmpty>No books found in your library.</CommandEmpty>
                ) : (
                  <CommandGroup heading="Your Books">
                    {searchData.results.map((book) => (
                      <CommandItem
                        key={book.id}
                        onSelect={() => handleBookSelect(book)}
                        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent"
                      >
                        <div className="flex-shrink-0">
                          {book.coverImage ? (
                            <img
                              src={book.coverImage}
                              alt={book.title}
                              className="w-8 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-8 h-10 bg-muted rounded flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {formatTitle(book.title)}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {formatAuthors(book.author)}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div
                            className={cn(
                              "px-2 py-1 rounded text-xs font-medium",
                              getReadingStateClasses(book.state)
                            )}
                          >
                            {book.state.replace("_", " ")}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Always show "Add book" option when search is complete */}
                {searchQuery.trim() && (
                  <>
                    {searchData.results.length > 0 && (
                      <div className="border-t border-border" />
                    )}
                    <CommandGroup>
                      <div
                        onClick={handleAddBookSelect}
                        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent"
                      >
                        <div className="flex-shrink-0">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              BRAND_COLORS.primary.bg
                            )}
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            Add &quot;
                            {searchQuery.length > 25
                              ? `${searchQuery.substring(0, 25)}...`
                              : searchQuery}
                            &quot;
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Search for books to add to your library
                          </div>
                        </div>
                      </div>
                    </CommandGroup>
                  </>
                )}
              </>
            )}
          </CommandList>
        )}
      </Command>
    </div>
  );
};

export default SearchDropdown;
