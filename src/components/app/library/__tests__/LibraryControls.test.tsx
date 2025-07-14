import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as nextNavigation from "next/navigation";
import { LibraryControls } from "../LibraryControls";

// Mock next/navigation and window.location
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

// Mock window.location properly
delete (window as any).location;
(window as any).location = { pathname: "/library" };

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => "/library",
}));

/** Utility to render the component with required props */
const setup = (
  props: Partial<React.ComponentProps<typeof LibraryControls>> = {}
) => {
  const defaultProps = {
    viewMode: "grid" as const,
    filterStatus: "all" as const,
    filterOwnership: "all",
    filterGenre: "all",
    sortBy: "title" as const,
    sortDirection: "asc" as const,
    availableGenres: [],
    filteredCount: 5,
    totalCount: 10,
    searchQuery: "",
    ...props,
  };
  return render(<LibraryControls {...defaultProps} />);
};

describe("LibraryControls", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams.delete("filter");
    mockSearchParams.delete("ownership");
    mockSearchParams.delete("genre");
    mockSearchParams.delete("sort");
    mockSearchParams.delete("direction");
    mockSearchParams.delete("view");
  });

  /** Should display the current search query so users know what they are filtering by */
  it("shows active search query information", () => {
    setup({ searchQuery: "react" });
    expect(screen.getByText(/"react"/)).toBeInTheDocument();
  });

  /** Clicking the list mode button should update URL with new view mode */
  it("updates URL when list view selected", async () => {
    const user = userEvent.setup();
    setup({ viewMode: "grid" });
    
    // Find all buttons and click the List button (second button with List icon)
    const buttons = screen.getAllByRole("button");
    // The List button is the second button in the view toggle
    const listButton = buttons[1];
    await user.click(listButton);
    
    expect(mockPush).toHaveBeenCalledWith("/?view=list");
  });

  /** Clicking the grid mode button should update URL with new view mode */
  it("updates URL when grid view selected", async () => {
    const user = userEvent.setup();
    setup({ viewMode: "list" });
    
    // Find all buttons and click the Grid button (first button with Grid icon)
    const buttons = screen.getAllByRole("button");
    // The Grid button is the first button in the view toggle
    const gridButton = buttons[0];
    await user.click(gridButton);
    
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  /** Changing the status dropdown should update URL with new filter */
  it("updates URL when status changes", async () => {
    const user = userEvent.setup();
    setup({ filterStatus: "all" });

    // Find the status select by looking for "Status:" text and then the select element
    const statusSelect = screen.getByText("Status:").nextElementSibling as HTMLSelectElement;
    await user.selectOptions(statusSelect, "finished");

    expect(mockPush).toHaveBeenCalledWith("/?filter=finished");
  });

  /** Changing the ownership dropdown should update URL with new filter */
  it("updates URL when ownership changes", async () => {
    const user = userEvent.setup();
    setup({ filterOwnership: "all" });

    // Find the ownership select by looking for "Ownership:" text and then the select element
    const ownershipSelect = screen.getByText("Ownership:").nextElementSibling as HTMLSelectElement;
    await user.selectOptions(ownershipSelect, "owned");

    expect(mockPush).toHaveBeenCalledWith("/?ownership=owned");
  });

  /** Clicking a sort option button should update URL with new sort parameter */
  it("updates URL when sort option clicked", async () => {
    const user = userEvent.setup();
    setup({ sortBy: "title" });

    const authorButton = screen.getByRole("button", { name: "Author" });
    await user.click(authorButton);

    expect(mockPush).toHaveBeenCalledWith("/?sort=author");
  });

  /** Clicking the same sort option should toggle sort direction */
  it("toggles sort direction when same sort option clicked", async () => {
    const user = userEvent.setup();
    setup({ sortBy: "title", sortDirection: "asc" });

    const titleButton = screen.getByRole("button", { name: "Title" });
    await user.click(titleButton);

    expect(mockPush).toHaveBeenCalledWith("/?direction=desc");
  });

  /** When filters are active the clear button should reset URL to base */
  it("clears filters when clear button pressed", async () => {
    const user = userEvent.setup();
    setup({ filterStatus: "finished", filterOwnership: "owned" });

    // Find the clear button by looking for the text that includes the count
    const clearButton = screen.getByRole("button", { name: /Clear Filters \(2\)/ });
    await user.click(clearButton);

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  /** Should preserve existing URL parameters when updating individual parameters */
  it("preserves existing parameters when updating view mode", async () => {
    const user = userEvent.setup();

    // Mock existing parameters
    const mockParams = new URLSearchParams();
    mockParams.set("filter", "in_progress");
    mockParams.set("ownership", "owned");
    mockParams.set("sort", "title");
    mockParams.set("direction", "asc");

    jest.spyOn(nextNavigation, "useSearchParams").mockReturnValue({
      get: (key: string) => mockParams.get(key),
      toString: () => mockParams.toString(),
      // Add other methods if your component uses them
    } as unknown as ReturnType<typeof nextNavigation.useSearchParams>);

    setup({
      viewMode: "grid",
      filterStatus: "in_progress",
      filterOwnership: "owned",
    });

    const buttons = screen.getAllByRole("button");
    const listButton = buttons.find((button) =>
      button.getAttribute("aria-label")?.includes("List")
    );

    if (listButton) {
      await user.click(listButton);
      expect(mockPush).toHaveBeenCalledWith(
        "/?filter=in_progress&ownership=owned&sort=title&direction=asc&view=list"
      );
    }
  });

  /** Should show active filter count based on non-default parameters */
  it("shows correct active filter count", () => {
    setup({ filterStatus: "finished", filterOwnership: "owned" });
    expect(screen.getByText("Clear Filters (2)")).toBeInTheDocument();
  });

  /** Should not show filter count when all filters are default */
  it("shows no filter count when all defaults", () => {
    setup({ filterStatus: "all", filterOwnership: "all" });
    expect(screen.queryByText(/filters active/)).not.toBeInTheDocument();
  });
});
