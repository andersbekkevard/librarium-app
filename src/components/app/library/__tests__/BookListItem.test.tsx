import type { Book } from "@/lib/models/models";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { Timestamp } from "firebase/firestore";
import BookListItem from "../BookListItem";

const createBook = (overrides: Partial<Book> = {}): Book => ({
  id: "book-id",
  title: "Book",
  author: "Author",
  state: "not_started", // must be "not_started" | "in_progress" | "finished"
  isOwned: true,
  progress: { currentPage: 0, totalPages: 100 },
  addedAt: { seconds: 0, nanoseconds: 0 } as Timestamp,
  updatedAt: { seconds: 0, nanoseconds: 0 } as Timestamp,
  ...overrides,
});

describe("BookListItem", () => {
  const baseBook = createBook({
    addedAt: { seconds: 0, nanoseconds: 0 } as Timestamp,
    updatedAt: { seconds: 0, nanoseconds: 0 } as Timestamp,
  });

  it("renders title and author", () => {
    render(<BookListItem book={baseBook} />);
    expect(screen.getAllByText(baseBook.title)).toHaveLength(2); // Mobile + Desktop
    expect(screen.getByText(`by ${baseBook.author}`)).toBeInTheDocument();
  });

  it("calls onBookClick when clicked", () => {
    const onClick = jest.fn();
    render(<BookListItem book={baseBook} onBookClick={onClick} />);
    const card = screen.getAllByText(baseBook.title)[0].closest('[data-slot="card"]') as HTMLElement;
    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledWith(baseBook.id);
  });

  it("shows progress for in_progress books", () => {
    const book = createBook({
      state: "in_progress",
      progress: { currentPage: 50, totalPages: 100 },
    });
    render(<BookListItem book={book} />);
    expect(screen.getAllByText("50 / 100 pages")).toHaveLength(2); // Mobile + Desktop
  });

  it("shows rating for finished books", () => {
    const book = createBook({
      state: "finished",
      rating: 4,
      progress: { currentPage: 100, totalPages: 100 },
    });
    render(<BookListItem book={book} />);
    expect(screen.getAllByTestId("star-icon")).toHaveLength(10); // 5 stars × 2 layouts
  });

  it("renders wishlist badge when not owned", () => {
    const book = createBook({ isOwned: false });
    render(<BookListItem book={book} />);
    expect(screen.getByText("Wishlist")).toBeInTheDocument();
  });
});
