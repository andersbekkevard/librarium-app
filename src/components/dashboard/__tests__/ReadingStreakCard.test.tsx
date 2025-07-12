import { render, screen } from "@testing-library/react";
import { ReadingStreakCard } from "../ReadingStreakCard";

import "@testing-library/jest-dom";

describe("ReadingStreakCard", () => {
  it("should render the streak days and default encouragement text", () => {
    render(<ReadingStreakCard streakDays={10} />);

    expect(screen.getByText("Reading Streak")).toBeInTheDocument();
    expect(screen.getByText("10 days")).toBeInTheDocument();
    expect(screen.getByText("Keep it up!")).toBeInTheDocument();
  });

  it('should display "day" for a 1-day streak', () => {
    render(<ReadingStreakCard streakDays={1} />);

    expect(screen.getByText("1 day")).toBeInTheDocument();
  });

  it("should display a custom encouragement message when provided", () => {
    render(
      <ReadingStreakCard
        streakDays={5}
        encouragementText="You are on a roll!"
      />
    );

    expect(screen.getByText("You are on a roll!")).toBeInTheDocument();
  });

  it("should render correctly with a streak of 0 days", () => {
    render(<ReadingStreakCard streakDays={0} />);

    expect(screen.getByText("0 days")).toBeInTheDocument();
  });
});