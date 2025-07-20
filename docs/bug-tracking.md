# Bug Tracking

## Recent Activity Height Matching Issue

### Current Behavioral Problem:

1. **Height inconsistency**: Recent Activity section doesn't properly match the height of Currently Reading section
2. **Poor space utilization**: Empty space exists instead of showing more activities to fill available height
3. **Broken fade effect**: Fade-out gradient appears at wrong position, cutting off activities that should be visible
4. **Static content display**: Number of activities shown doesn't adapt to available space

### Desired Behavior:

1. **Perfect height matching**: Recent Activity section (including activities + fade + "View all activity" button) should have EXACTLY the same height as Currently Reading section
2. **Dynamic content filling**: 
   - When Currently Reading shows 1 row (≤2 books): Recent Activity should show ~3-4 activities
   - When Currently Reading shows 2 rows (>2 books): Recent Activity should show ~6-8 activities
3. **Proper fade positioning**: Fade-out gradient should be positioned at the very bottom of the activities area, just above the "View all activity" button
4. **Maximum content display**: Show as many activities as possible to fill the available space, not leave empty areas

### Technical Requirements:

- Recent Activity container height = Currently Reading container height
- Activities should fill available space efficiently
- Fade gradient positioned at `bottom-16` (64px from bottom) to account for button space
- Fade height should be minimal (8-12px) for subtle effect
- No empty space - content should dynamically adjust based on container height
- "View all activity" button always visible at bottom with proper z-index

### Root Cause:

The current implementation uses fixed positioning and static content limits instead of dynamically calculating how much content can fit in the available space to match the Currently Reading height.