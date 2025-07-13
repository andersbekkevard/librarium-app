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
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('1,200')).toBeInTheDocument();
  });

  /** Should show the current reading streak with proper day label */
  it('renders reading streak card', () => {
    render(<StatsGrid stats={stats} />);
    expect(screen.getByText('Reading Streak')).toBeInTheDocument();
    expect(screen.getByText('5 days')).toBeInTheDocument();
  });

  /** Stat cards should display their icons for visual context */
  it('includes icon elements for each stat', () => {
    render(<StatsGrid stats={stats} />);
    expect(screen.getAllByTestId('stat-card-icon')).toHaveLength(3);
  });
});

