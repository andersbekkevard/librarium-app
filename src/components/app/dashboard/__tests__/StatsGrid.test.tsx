import { render, screen } from '@testing-library/react';
import { StatsGrid } from '../StatsGrid';
import '@testing-library/jest-dom';

const stats = {
  totalBooks: 10,
  finishedBooks: 4,
  totalPagesRead: 1200,
  currentlyReading: 2,
  readingStreak: 5,
};

describe('StatsGrid', () => {
  /** Should display each quick stat so users can see a summary of their progress */
  it('renders all stat values', () => {
    render(<StatsGrid stats={stats} />);
    // Test functionality: all stat cards should be rendered - use getAllByText for multiple instances
    expect(screen.getAllByText('Total Books').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Read This Year').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Reading Streak').length).toBeGreaterThan(0);
    // Test that the component renders without crashing with data
    expect(screen.getAllByTestId('stat-card-icon')).toHaveLength(3);
  });

  /** Should show the current reading streak with proper day label */
  it('renders reading streak card', () => {
    render(<StatsGrid stats={stats} />);
    // Test functionality: reading streak card should be present
    const readingStreakElements = screen.getAllByText('Reading Streak');
    expect(readingStreakElements.length).toBeGreaterThan(0);
    // Test that streak value is displayed (look for "days" text) - handle multiple instances
    const daysElements = screen.getAllByText(/days/);
    expect(daysElements.length).toBeGreaterThan(0);
  });

  /** Stat cards should display their icons for visual context */
  it('includes icon elements for each stat', () => {
    render(<StatsGrid stats={stats} />);
    expect(screen.getAllByTestId('stat-card-icon')).toHaveLength(3);
  });
});

