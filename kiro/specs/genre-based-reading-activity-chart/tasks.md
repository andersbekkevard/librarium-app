# Implementation Plan

## Overview
Simple 4-task implementation leveraging existing `genre-colors.ts` utility and Recharts' native stacking capabilities.

## Tasks

- [ ] 1. Update pie chart to use shared color utility
  - Refactor existing `genreData` useMemo to use `createGenreColorMapping` from `genre-colors.ts`
  - Replace inline color assignment with shared utility calls
  - Ensure visual output remains identical to current implementation
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 2. Implement genre-segmented historical data processing
  - Create `historicalDataByGenre` useMemo that extends existing `historicalData` logic
  - Group progress events by month and genre using existing book-to-genre resolution
  - Handle missing book references by defaulting to "Unknown" genre
  - Structure data for Recharts consumption: `{ month: "Jan 2024", Fiction: 120, Mystery: 45 }`
  - _Requirements: 1.1, 1.2, 3.2_

- [ ] 3. Replace single Area with stacked genre areas
  - Extract available genres from historical data
  - Generate color mapping using existing `createGenreColorMapping` utility
  - Replace single `<Area>` component with dynamically generated areas using `stackId="genres"`
  - Apply genre colors directly to Area components via `stroke` and `fill` props
  - Enhance tooltip to show genre breakdown using existing `ChartTooltip` patterns
  - _Requirements: 1.1, 1.3, 2.1, 3.3, 3.4_

- [ ] 4. Add focused unit tests
  - Test genre data processing logic for correct grouping and aggregation
  - Verify color consistency between pie chart and area chart
  - Test stacked area chart rendering with multiple genres
  - Validate tooltip functionality with genre-specific information
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.1, 3.2_

## Implementation Notes

### Leveraging Recharts Features
- Use `stackId="genres"` for automatic area stacking
- No custom chart configuration needed - pass colors directly to Area components
- Existing `ChartTooltip` handles multi-series data automatically

### Existing Utilities
- `createGenreColorMapping` already implemented and tested
- Current `historicalData` processing pattern can be extended
- Error handling patterns already established in codebase

### Performance
- Extend existing `useMemo` optimization for new data processing
- No additional dependencies or complex state management required
- Recharts handles efficient re-rendering of stacked areas
