import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LibraryControls } from '../LibraryControls';
import '@testing-library/jest-dom';

/** Utility to render the component with required props */
const setup = (props: Partial<React.ComponentProps<typeof LibraryControls>> = {}) => {
  const defaultProps = {
    viewMode: 'grid' as const,
    onViewModeChange: jest.fn(),
    filterStatus: 'all' as const,
    onFilterStatusChange: jest.fn(),
    filterOwnership: 'all',
    onFilterOwnershipChange: jest.fn(),
    sortBy: 'title' as const,
    sortDirection: 'asc' as const,
    onSortChange: jest.fn(),
    onClearFilters: jest.fn(),
    filteredCount: 5,
    totalCount: 10,
    ...props,
  };
  return render(<LibraryControls {...defaultProps} />);
};

describe('LibraryControls', () => {
  /** Should display the current search query so users know what they are filtering by */
  it('shows active search query information', () => {
    setup({ searchQuery: 'react' });
    expect(screen.getByText(/"react"/)).toBeInTheDocument();
  });

  /** Clicking the list mode button should request a change to list view */
  it('invokes onViewModeChange when list view selected', async () => {
    const user = userEvent.setup();
    const onViewModeChange = jest.fn();
    setup({ onViewModeChange });
    const buttons = screen.getAllByRole('button', { name: '' });
    await user.click(buttons[1]);
    expect(onViewModeChange).toHaveBeenCalledWith('list');
  });

  /** Changing the status dropdown should inform the parent of the new filter */
  it('calls onFilterStatusChange when status changes', () => {
    const onFilterStatusChange = jest.fn();
    setup({ onFilterStatusChange });
    const select = screen.getAllByRole('combobox')[0];
    fireEvent.change(select, { target: { value: 'finished' } });
    expect(onFilterStatusChange).toHaveBeenCalledWith('finished');
  });

  /** Clicking a sort option button should emit the chosen sort key */
  it('triggers onSortChange when sort option clicked', async () => {
    const user = userEvent.setup();
    const onSortChange = jest.fn();
    setup({ onSortChange });
    await user.click(screen.getByRole('button', { name: 'Author' }));
    expect(onSortChange).toHaveBeenCalledWith('author');
  });

  /** When filters are active the clear button should appear and call onClearFilters */
  it('clears filters when clear button pressed', async () => {
    const user = userEvent.setup();
    const onClearFilters = jest.fn();
    setup({ filterStatus: 'finished', onClearFilters });
    await user.click(screen.getByRole('button', { name: /Clear Filters/ }));
    expect(onClearFilters).toHaveBeenCalled();
  });
});

