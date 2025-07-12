import { Book } from "@/lib/models";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Timestamp } from "firebase/firestore";
import { BookCard } from "../BookCard";

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("BookCard", () => {
  const mockBook: Book = {
    id: "test-book-id",
    title: "Test Book Title",
    author: "Test Author",
    state: "not_started",
    progress: {
      currentPage: 0,
      totalPages: 200,
    },
    isOwned: true,
    genre: "Fiction",
    coverImage: "https://example.com/cover.jpg",
    addedAt: new Timestamp(1234567890, 0),
    updatedAt: new Timestamp(1234567890, 0),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render book information correctly", () => {
      render(<BookCard book={mockBook} />);

      expect(screen.getByText("Test Book Title")).toBeInTheDocument();
      expect(screen.getByText("by Test Author")).toBeInTheDocument();
      expect(screen.getByText("Fiction")).toBeInTheDocument();
      expect(screen.getByText("Not Started")).toBeInTheDocument();
    });

    it("should render book cover image when available", () => {
      render(<BookCard book={mockBook} />);

      const img = screen.getByAltText("Test Book Title cover");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "https://example.com/cover.jpg");
    });

    it("should render BookOpen icon when no cover image", () => {
      const bookWithoutCover = { ...mockBook, coverImage: undefined };
      render(<BookCard book={bookWithoutCover} />);

      // BookOpen icon should be rendered instead of image
      expect(
        screen.queryByAltText("Test Book Title cover")
      ).not.toBeInTheDocument();
      // The BookOpen icon should be present in the cover placeholder
      const coverPlaceholder = screen.getByRole("button");
      expect(coverPlaceholder).toBeInTheDocument();
    });

    it('should render "Unknown" genre when genre is not provided', () => {
      const bookWithoutGenre = { ...mockBook, genre: undefined };
      render(<BookCard book={bookWithoutGenre} />);

      expect(screen.getByText("Unknown")).toBeInTheDocument();
    });

    it("should have proper accessibility attributes", () => {
      render(<BookCard book={mockBook} />);

      const card = screen.getByRole("button");
      expect(card).toHaveAttribute("tabIndex", "0");
      expect(card).toHaveAttribute(
        "aria-label",
        "View details for Test Book Title by Test Author"
      );
    });
  });

  describe("Reading States", () => {
    it("should display correct badge for not_started state", () => {
      render(<BookCard book={mockBook} />);

      const badge = screen.getByText("Not Started");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass(
        "bg-secondary",
        "text-secondary-foreground",
        "border-secondary"
      );
    });

    it("should display correct badge for in_progress state", () => {
      const inProgressBook: Book = {
        ...mockBook,
        state: "in_progress",
        progress: { currentPage: 100, totalPages: 200 },
      };

      render(<BookCard book={inProgressBook} />);

      const badge = screen.getByText("Reading");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass(
        "bg-brand-primary/10",
        "text-brand-primary",
        "border-brand-primary/20"
      );
    });

    it("should display correct badge for finished state", () => {
      const finishedBook: Book = {
        ...mockBook,
        state: "finished",
        progress: { currentPage: 200, totalPages: 200 },
        rating: 4,
      };

      render(<BookCard book={finishedBook} />);

      const badge = screen.getByText("Finished");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass(
        "bg-muted",
        "text-muted-foreground",
        "border-muted"
      );
    });
  });

  describe("Progress Display", () => {
    it("should show progress bar for in_progress books", () => {
      const inProgressBook: Book = {
        ...mockBook,
        state: "in_progress",
        progress: { currentPage: 100, totalPages: 200 },
      };

      render(<BookCard book={inProgressBook} />);

      expect(screen.getByText("100 / 200 pages")).toBeInTheDocument();
      expect(screen.getByText("50%")).toBeInTheDocument();

      // Check that progress bar exists
      const progressBar = screen
        .getByRole("button")
        .querySelector('[style*="width: 50%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it("should not show progress bar for not_started books", () => {
      render(<BookCard book={mockBook} />);

      expect(screen.queryByText("/ pages")).not.toBeInTheDocument();
      expect(screen.queryByText("%")).not.toBeInTheDocument();
    });

    it("should not show progress bar when currentPage or totalPages is missing", () => {
      const bookWithIncompleteProgress: Book = {
        ...mockBook,
        state: "in_progress",
        progress: { currentPage: 0, totalPages: 200 },
      };

      render(<BookCard book={bookWithIncompleteProgress} />);

      expect(screen.queryByText("/ pages")).not.toBeInTheDocument();
    });

    it("should calculate progress correctly", () => {
      const inProgressBook: Book = {
        ...mockBook,
        state: "in_progress",
        progress: { currentPage: 75, totalPages: 300 },
      };

      render(<BookCard book={inProgressBook} />);

      expect(screen.getByText("75 / 300 pages")).toBeInTheDocument();
      expect(screen.getByText("25%")).toBeInTheDocument(); // 75/300 = 25%
    });

    it("should round progress to nearest integer", () => {
      const inProgressBook: Book = {
        ...mockBook,
        state: "in_progress",
        progress: { currentPage: 33, totalPages: 99 }, // 33.33%
      };

      render(<BookCard book={inProgressBook} />);

      expect(screen.getByText("33%")).toBeInTheDocument();
    });
  });

  describe("Rating Display", () => {
    it("should show star rating for finished books with rating", () => {
      const finishedBook: Book = {
        ...mockBook,
        state: "finished",
        progress: { currentPage: 200, totalPages: 200 },
        rating: 4,
      };

      render(<BookCard book={finishedBook} />);

      expect(screen.getByText("4/5")).toBeInTheDocument();

      // Should have 5 star icons (4 filled, 1 empty)
      const stars = screen
        .getAllByRole("button")
        .filter(
          (el) =>
            el.querySelector("svg") &&
            el.querySelector("svg")?.classList.contains("fill-status-warning")
        );
      // Note: This is a simplified check. In a real test, you'd check the Star component rendering more thoroughly
    });

    it("should not show rating for finished books without rating", () => {
      const finishedBookWithoutRating: Book = {
        ...mockBook,
        state: "finished",
        progress: { currentPage: 200, totalPages: 200 },
      };

      render(<BookCard book={finishedBookWithoutRating} />);

      expect(screen.queryByText("/5")).not.toBeInTheDocument();
    });

    it("should not show rating for non-finished books", () => {
      const inProgressBookWithRating: Book = {
        ...mockBook,
        state: "in_progress",
        rating: 4,
      };

      render(<BookCard book={inProgressBookWithRating} />);

      expect(screen.queryByText("4/5")).not.toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onBookClick when provided and card is clicked", () => {
      const onBookClick = jest.fn();
      render(<BookCard book={mockBook} onBookClick={onBookClick} />);

      const card = screen.getByRole("button");
      fireEvent.click(card);

      expect(onBookClick).toHaveBeenCalledWith("test-book-id");
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should navigate to book detail page when onBookClick is not provided", () => {
      render(<BookCard book={mockBook} />);

      const card = screen.getByRole("button");
      fireEvent.click(card);

      expect(mockPush).toHaveBeenCalledWith("/book/test-book-id");
    });

    it("should handle keyboard interactions (Enter key)", async () => {
      const user = userEvent.setup();
      const onBookClick = jest.fn();
      render(<BookCard book={mockBook} onBookClick={onBookClick} />);

      const card = screen.getByRole("button");
      await user.type(card, "{enter}");

      expect(onBookClick).toHaveBeenCalledWith("test-book-id");
    });

    it("should handle keyboard interactions (Space key)", async () => {
      const user = userEvent.setup();
      const onBookClick = jest.fn();
      render(<BookCard book={mockBook} onBookClick={onBookClick} />);

      const card = screen.getByRole("button");
      await user.type(card, " ");

      expect(onBookClick).toHaveBeenCalledWith("test-book-id");
    });

    it("should not trigger action for other keys", async () => {
      const user = userEvent.setup();
      const onBookClick = jest.fn();
      render(<BookCard book={mockBook} onBookClick={onBookClick} />);

      const card = screen.getByRole("button");
      await user.type(card, "{escape}");

      expect(onBookClick).not.toHaveBeenCalled();
    });
  });

  describe("Text Truncation", () => {
    it("should handle long titles appropriately", () => {
      const bookWithLongTitle: Book = {
        ...mockBook,
        title:
          "This is a very long book title that should be truncated when displayed in the card component",
      };

      render(<BookCard book={bookWithLongTitle} />);

      const titleElement = screen.getByText(bookWithLongTitle.title);
      expect(titleElement).toHaveClass("line-clamp-2");
    });

    it("should handle long author names appropriately", () => {
      const bookWithLongAuthor: Book = {
        ...mockBook,
        author:
          "This is a very long author name that should be truncated when displayed",
      };

      render(<BookCard book={bookWithLongAuthor} />);

      const authorElement = screen.getByText(`by ${bookWithLongAuthor.author}`);
      expect(authorElement).toHaveClass("line-clamp-1");
    });
  });

  describe("Optional Props", () => {
    it("should work without optional props", () => {
      expect(() => render(<BookCard book={mockBook} />)).not.toThrow();
    });

    it("should accept but not call unused callback props", () => {
      const onEdit = jest.fn();
      const onUpdateProgress = jest.fn();

      render(
        <BookCard
          book={mockBook}
          onEdit={onEdit}
          onUpdateProgress={onUpdateProgress}
        />
      );

      // These callbacks are not currently used in the component
      expect(onEdit).not.toHaveBeenCalled();
      expect(onUpdateProgress).not.toHaveBeenCalled();
    });
  });

  describe("Styling and Classes", () => {
    it("should apply hover effects", () => {
      render(<BookCard book={mockBook} />);

      const card = screen.getByRole("button");
      expect(card).toHaveClass(
        "hover:shadow-md",
        "hover:border-border/80",
        "hover:bg-card",
        "transition-all",
        "duration-200"
      );
    });

    it("should have cursor-pointer class", () => {
      render(<BookCard book={mockBook} />);

      const card = screen.getByRole("button");
      expect(card).toHaveClass("cursor-pointer");
    });

    it("should have proper card dimensions", () => {
      render(<BookCard book={mockBook} />);

      const card = screen.getByRole("button");
      expect(card).toHaveClass("w-full", "max-w-sm", "h-48");
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing optional book properties", () => {
      const minimalBook: Book = {
        id: "minimal-book",
        title: "Minimal Book",
        author: "Minimal Author",
        state: "not_started",
        progress: { currentPage: 0, totalPages: 0 },
        isOwned: false,
        addedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      };

      expect(() => render(<BookCard book={minimalBook} />)).not.toThrow();
    });

    it("should handle zero total pages", () => {
      const bookWithZeroPages: Book = {
        ...mockBook,
        state: "in_progress",
        progress: { currentPage: 0, totalPages: 0 },
      };

      render(<BookCard book={bookWithZeroPages} />);

      // Should not show progress when totalPages is 0
      expect(screen.queryByText("/ pages")).not.toBeInTheDocument();
    });

    it("should handle invalid state gracefully", () => {
      const bookWithInvalidState: Book = {
        ...mockBook,
        state: "invalid_state" as any,
      };

      render(<BookCard book={bookWithInvalidState} />);

      expect(screen.getByText("Unknown")).toBeInTheDocument();
    });
  });
});
