# Requirements Document

## Introduction

This feature enhances the existing "Reading Activity Over Time" chart on the Statistics page by transforming it into a stacked area chart segmented by genre. The implementation leverages the existing `genre-colors.ts` utility and Recharts' built-in stacking capabilities for a minimal, maintainable solution.

## Requirements

### Requirement 1: Genre-Segmented Reading Activity

**User Story:** As a reader using the statistics page, I want to see my reading activity over time broken down by genre, so that I can understand my reading patterns across different book categories.

#### Acceptance Criteria

1. WHEN the user views the Statistics page THEN the "Reading Activity Over Time" chart SHALL display reading activity as a stacked area chart with each genre as a separate layer
2. WHEN multiple genres have been read in a given month THEN Recharts SHALL automatically stack the areas using `stackId="genres"`
3. WHEN a user hovers over any part of the chart THEN the enhanced tooltip SHALL display the month, total pages, and genre breakdown
4. WHEN no books have been read THEN the chart SHALL display the existing empty state message

### Requirement 2: Color Consistency with Pie Chart

**User Story:** As a reader viewing statistics, I want the genre colors in both charts to be identical, so that I can easily correlate data between visualizations.

#### Acceptance Criteria

1. WHEN both charts are displayed THEN each genre SHALL use the same color from the existing `createGenreColorMapping` utility
2. WHEN the "Unknown" genre appears THEN it SHALL use the consistent light grey color across both charts
3. WHEN the pie chart is updated to use the shared color utility THEN color assignment SHALL remain visually identical to current implementation

### Requirement 3: Performance and Compatibility

**User Story:** As a reader using the statistics dashboard, I want the enhanced chart to maintain current performance while using standard Recharts features.

#### Acceptance Criteria

1. WHEN the Statistics page loads THEN the enhanced chart SHALL render without performance degradation
2. WHEN chart data updates THEN it SHALL use the existing useMemo optimization pattern
3. WHEN rendering the stacked chart THEN it SHALL use Recharts' native stacking with `stackId` prop
4. WHEN the component re-renders THEN the chart SHALL maintain responsive behavior