# Design Document

## Overview

This design transforms the existing single-area "Reading Activity Over Time" chart into a genre-segmented stacked area chart. The implementation leverages the existing `genre-colors.ts` utility and Recharts' built-in stacking capabilities for minimal complexity and maximum maintainability.

## Architecture

### Simple Data Flow
1. **Genre Color Mapping** → Use existing `createGenreColorMapping` utility
2. **Genre-Segmented Data Processing** → Extend current `historicalData` logic to group by genre
3. **Stacked Area Chart** → Use Recharts' native `stackId` prop for automatic stacking
4. **Enhanced Tooltip** → Leverage existing `ChartTooltip` with custom content

### Component Structure
```
StatisticsPage
├── genreColorMapping (from existing utility)
├── historicalDataByGenre (new data processing)
└── Multiple Area components with stackId="genres"
```

## Implementation Details

### Data Structure
Extend the existing monthly data structure to include genre breakdown:

```typescript
interface HistoricalDataByGenre {
  month: string; // Existing "MMM yyyy" format
  [genre: string]: number | string; // Dynamic genre keys
}

// Example:
[
  { month: "Jan 2024", "Fiction": 120, "Mystery": 45, "Unknown": 20 },
  { month: "Feb 2024", "Fiction": 80, "Non-Fiction": 60 }
]
```

### Genre Resolution
Simple book-to-genre mapping using existing patterns:

```typescript
const resolveGenre = (bookId: string): string => {
  const book = books.find(b => b.id === bookId);
  return book?.genre || "Unknown";
};
```

### Chart Rendering
Use Recharts' native stacking with minimal configuration:

```typescript
// Generate areas dynamically
{availableGenres.map(genre => (
  <Area
    key={genre}
    type="monotone"
    dataKey={genre}
    stackId="genres"
    stroke={genreColorMap[genre]}
    fill={genreColorMap[genre]}
    fillOpacity={0.2}
    strokeWidth={2}
  />
))}
```

## Error Handling

### Simple Safeguards
1. **Missing Books**: Default to "Unknown" genre
2. **Invalid Pages**: Clamp negative values to 0  
3. **Empty Data**: Maintain existing empty state UI
4. **Performance**: Extend existing `useMemo` optimization

## Testing Strategy

### Focused Testing
1. **Data Processing**: Test genre grouping and monthly aggregation
2. **Color Consistency**: Verify shared utility usage between charts
3. **Recharts Integration**: Test stacked area rendering and interactions

## Implementation Plan

### Single-Phase Approach
1. **Update Pie Chart** → Use `createGenreColorMapping` utility
2. **Implement Genre Data Processing** → Extend existing `historicalData` logic
3. **Update Area Chart** → Replace single Area with multiple stacked Areas
4. **Add Tests** → Cover new functionality

## Dependencies

### Existing Only
- **Recharts**: Native stacking with `stackId` prop
- **genre-colors.ts**: Already implemented color utility
- **Current Data Processing**: Extend existing patterns

No new dependencies required.

## Backward Compatibility

Maintains full compatibility:
- Same data sources and processing patterns
- Existing loading states and error handling
- Performance characteristics preserved
- UI consistency maintained