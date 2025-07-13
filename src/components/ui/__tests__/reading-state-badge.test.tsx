import { render, screen } from "@testing-library/react";
import { ReadingStateBadge } from "../reading-state-badge";

describe("ReadingStateBadge", () => {
  it("renders 'Not Started' state correctly", () => {
    render(<ReadingStateBadge state="not_started" />);

    expect(screen.getByText("Not Started")).toBeInTheDocument();

    const badge = screen.getByText("Not Started").closest("span");
    expect(badge).toHaveClass(
      "bg-[var(--secondary)]",
      "text-[var(--secondary-foreground)]",
      "border-[var(--secondary)]"
    );
  });

  it("renders 'Reading' state correctly", () => {
    render(<ReadingStateBadge state="in_progress" />);

    expect(screen.getByText("Reading")).toBeInTheDocument();

    const badge = screen.getByText("Reading").closest("span");
    expect(badge).toHaveClass(
      "bg-[var(--reading-in-progress-bg)]",
      "text-[var(--reading-in-progress-text)]",
      "border-[var(--reading-in-progress-border)]"
    );
  });

  it("renders 'Finished' state correctly", () => {
    render(<ReadingStateBadge state="finished" />);

    expect(screen.getByText("Finished")).toBeInTheDocument();

    const badge = screen.getByText("Finished").closest("span");
    expect(badge).toHaveClass(
      "bg-[var(--reading-finished-bg)]",
      "text-[var(--reading-finished-text)]",
      "border-[var(--reading-finished-border)]"
    );
  });

  it("shows icon when showIcon is true", () => {
    render(<ReadingStateBadge state="not_started" showIcon={true} />);

    // Check for icon presence by looking for SVG element
    const icon = screen.getByTestId("clock-icon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("h-3", "w-3");
  });

  it("hides icon when showIcon is false", () => {
    render(<ReadingStateBadge state="not_started" showIcon={false} />);

    // Icon should not be present
    expect(screen.queryByTestId("clock-icon")).not.toBeInTheDocument();
  });

  it("shows correct icons for each state", () => {
    const { rerender } = render(
      <ReadingStateBadge state="not_started" showIcon={true} />
    );
    expect(screen.getByTestId("clock-icon")).toBeInTheDocument();

    rerender(<ReadingStateBadge state="in_progress" showIcon={true} />);
    expect(screen.getByTestId("play-icon")).toBeInTheDocument();

    rerender(<ReadingStateBadge state="finished" showIcon={true} />);
    expect(screen.getByTestId("check-circle-icon")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <ReadingStateBadge state="not_started" className="custom-badge-class" />
    );

    const badge = screen.getByText("Not Started").closest("span");
    expect(badge).toHaveClass("custom-badge-class");
  });

  it("uses correct badge variants for each state", () => {
    const { rerender } = render(<ReadingStateBadge state="not_started" />);
    let badge = screen.getByText("Not Started").closest("span");
    expect(badge).toHaveClass("bg-[var(--secondary)]");

    rerender(<ReadingStateBadge state="in_progress" />);
    badge = screen.getByText("Reading").closest("span");
    expect(badge).toHaveClass("bg-[var(--reading-in-progress-bg)]");

    rerender(<ReadingStateBadge state="finished" />);
    badge = screen.getByText("Finished").closest("span");
    expect(badge).toHaveClass("bg-[var(--reading-finished-bg)]");
  });
});
