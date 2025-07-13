"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from "@/components/ui/command";
import { ReadingStateBadge } from "@/components/ui/reading-state-badge";
import { BRAND_COLORS } from "@/lib/design/colors";
import { Book } from "@/lib/models/models";
import { useBooksContext } from "@/lib/providers/BooksProvider";
import { cn } from "@/lib/utils/utils";
import { BookOpen, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface SearchDropdownProps {
  placeholder?: string;
  className?: string;
}

// Search state enum
type SearchState = "idle" | "searching" | "completed";

interface SearchData {
  state: SearchState;
  query: string;
  results: Book[];
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  placeholder = "Search books, authors, or genres...",
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Search state management
  const [searchData, setSearchData] = useState<SearchData>({
    state: "idle",
    query: "",
    results: [],
  });

  // Cache for completed searches
  const [searchCache, setSearchCache] = useState<Record<string, Book[]>>({});

  const { searchBooks, books } = useBooksContext();
  const router = useRouter();

  // Search management refs
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

  // Main search function
  const performSearch = useCallback(
    async (query: string) => {
      const trimmedQuery = query.trim();

      // Cancel any previous search
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      // Check cache first
      if (searchCache[trimmedQuery]) {
        setSearchData({
          state: "completed",
          query: trimmedQuery,
          results: searchCache[trimmedQuery],
        });
        return;
      }

      // Create new AbortController for this search
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Start search
      setSearchData({
        state: "searching",
        query: trimmedQuery,
        results: [],
      });

      currentSearchRef.current = trimmedQuery;

      try {
        // Try service search first
        const result = await searchBooks(trimmedQuery, 8);

        // Check if this search was aborted
        if (abortController.signal.aborted) {
          return;
        }

        // Check if this search is still current
        if (currentSearchRef.current !== trimmedQuery) {
          return;
        }

        let results: Book[] = [];
        if (result.success) {
          results = result.data || [];
        } else {
          results = performLocalSearch(trimmedQuery);
        }

        setSearchData({
          state: "completed",
          query: trimmedQuery,
          results: results,
        });

        // Update cache after state update
        setSearchCache((prev) => ({ ...prev, [trimmedQuery]: results }));
      } catch (error: any) {
        // Check if error is due to cancellation
        if (error.name === "AbortError" || abortController.signal.aborted) {
          return;
        }

        // Check if search is still current
        if (currentSearchRef.current !== trimmedQuery) {
          return;
        }

        // Fallback to local search - FORCED RE-RENDER
        const results = performLocalSearch(trimmedQuery);

        setSearchData({
          state: "completed",
          query: trimmedQuery,
          results: results,
        });

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
      setSearchQuery(value);
      setIsOpen(value.length > 0);

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      const trimmedValue = value.trim();

      if (!trimmedValue) {
        // Cancel any in-flight search
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
        // Clear search state when input is empty
        setSearchData({
          state: "idle",
          query: "",
          results: [],
        });
        currentSearchRef.current = "";
        return;
      }

      // Check cache immediately for instant results
      if (searchCache[trimmedValue]) {
        // Instant results from cache
        setSearchData({
          state: "completed",
          query: trimmedValue,
          results: searchCache[trimmedValue],
        });
        return;
      }

      // Start search after debounce
      searchTimeoutRef.current = setTimeout(() => {
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
      router.push(`/books/${book.id}`);
      setIsOpen(false);
      setSearchQuery("");
      setSearchData({ state: "idle", query: "", results: [] });
    },
    [router]
  );

  const handleAddBookSelect = useCallback(() => {
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

  return (
    <div className={cn("relative w-full", className)}>
      <Command
        onKeyDown={handleKeyDown}
        className="rounded-lg border border-border bg-popover shadow-md"
        shouldFilter={false}
      >
        <CommandInput
          placeholder={placeholder}
          value={searchQuery}
          onValueChange={handleInputChange}
          className="h-10"
        />

        {isOpen && (
          <CommandList className="absolute top-full left-0 right-0 max-h-[400px] overflow-y-auto border border-border bg-popover shadow-lg rounded-b-lg z-50 mt-1">
            {/* Show CMDK loading state while searching */}
            {searchData.state === "searching" && (
              <CommandLoading>
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
              </CommandLoading>
            )}

            {/* Show results only when search is completed */}
            {searchData.state === "completed" && (
              <>
                {searchData.results.length === 0 ? (
                  <CommandEmpty>
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No books found in your library.
                    </div>
                  </CommandEmpty>
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
                            {book.title}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {book.author}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <ReadingStateBadge state={book.state} />
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
                      <CommandItem
                        onSelect={handleAddBookSelect}
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
                      </CommandItem>
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
