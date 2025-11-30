# UI Refactor V1 - Changes Summary

## 1. Design System & Theme Architecture
- **Dual-Theme Strategy**: Split the application into two distinct visual themes.
  - **Landing Page (`Dark Mode`)**: "Eden" inspired aesthetic. Deep forest green background, cream text, noise texture overlay.
  - **App Dashboard (`Light Mode`)**: "Notion" inspired aesthetic. Clean white background, soft greys, rounded-rectangle shapes, high readability.
- **Typography**: Introduced `Fraunces` (Serif) for headings to match the "editorial" look, alongside `Geist` (Sans) for UI text.
- **Global Variables**: Updated `src/app/globals.css` with a comprehensive set of CSS variables for both themes, including specific overrides for the noise texture in dark mode.

## 2. Component Styling Updates
- **Buttons (`src/components/ui/button.tsx`)**:
  - Updated initially to `rounded-full` (pill shape) for the landing page look.
  - **Correction**: Reverted to `rounded-md` (rounded rectangle) to correctly match the Notion-style buttons required for the main app dashboard.
- **Cards (`src/components/ui/card.tsx`)**:
  - Softened border radius to `rounded-2xl` for a friendlier, more organic feel.
- **Inputs (`src/components/ui/input.tsx`)**:
  - Updated to `rounded-xl` to match the softened card aesthetic.

## 3. Layout Configuration
- **Root Layout (`src/app/layout.tsx`)**: 
  - Added `Fraunces` font variable injection.
  - Configured global font smoothing.
- **Landing Page Layout (`src/app/(landing)/layout.tsx`)**:
  - Enforced `forcedTheme="dark"` to ensure the green/cream theme is always active, regardless of user system preferences.
- **App Layout (`src/app/(app)/layout.tsx`)**:
  - Enforced `forcedTheme="light"` to ensure the white/grey Notion theme is always active for the dashboard.

## 4. Sidebar Refinements (`src/components/app/layout/Sidebar.tsx`)**
- **Visuals**: Changed background to `bg-sidebar` (light grey) to separate it from the main content area.
- **Add Book Button**: Styled as a prominent `rounded-xl` element with `shadow-sm` for better hierarchy.
- **Navigation Items**:
  - Simplified list items (removed heavy horizontal dividers).
  - Refined active/inactive states for a cleaner, less cluttered look.
  - Added "Coming Soon" section with a subtle label style.

