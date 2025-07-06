# Librarium Color System

This document describes the centralized color system used throughout the Librarium application. All colors are defined in `src/app/globals.css` and can be easily modified to change the brand appearance.

## 🎨 Brand Colors

### Primary Brand Colors

These are the main brand colors used throughout the application:

- **`brand-primary`**: Vibrant blue - Used for primary actions, links, and highlights
- **`brand-secondary`**: Dark blue-grey - Used for secondary actions and accents
- **`brand-accent`**: Light vibrant blue - Used for additional accents and highlights

### Usage Examples

```css
/* In Tailwind classes */
bg-brand-primary         /* Primary background */
text-brand-primary       /* Primary text */
border-brand-primary     /* Primary border */

bg-brand-secondary       /* Secondary background */
hover:bg-brand-secondary-hover  /* Secondary hover state */
```

## 🔧 How to Change Brand Colors

To modify the brand colors across the entire application:

1. **Open `src/app/globals.css`**
2. **Find the `:root` section** (around line 45)
3. **Modify the brand color values**:

```css
:root {
  /* Change these values to your desired colors */
  --brand-primary: oklch(0.55 0.25 240); /* Vibrant blue primary color */
  --brand-secondary: oklch(0.4 0.05 220); /* Dark blue-grey secondary */
  --brand-accent: oklch(0.7 0.2 240); /* Light vibrant blue accent */
}
```

4. **Also update the `.dark` section** (around line 95) for dark mode variants:

```css
.dark {
  /* Dark mode variants - typically brighter */
  --brand-primary: oklch(0.7 0.25 240);
  --brand-secondary: oklch(0.6 0.05 220);
  --brand-accent: oklch(0.8 0.2 240);
}
```

## 🎯 Component Usage

### Current Usage

- **Sidebar**: Add Book button uses pure black (light mode) / white (dark mode), active states use `brand-primary`
- **Header**: Search focus ring uses `brand-primary`
- **BookCard**: Progress bars use `brand-primary`
- **Notifications**: Error notifications use `status-error`

### Available Color Classes

```css
/* Backgrounds */
bg-brand-primary
bg-brand-secondary
bg-brand-accent

/* Hover states */
hover:bg-brand-primary-hover
hover:bg-brand-secondary-hover
hover:bg-brand-accent-hover

/* Text colors */
text-brand-primary
text-brand-secondary
text-brand-accent

/* Borders */
border-brand-primary
border-brand-secondary
border-brand-accent
```

## 📊 Status Colors

The application also includes semantic status colors:

- **`status-success`**: Green - For success states
- **`status-warning`**: Yellow - For warnings and ratings
- **`status-error`**: Red - For errors and important notifications
- **`status-info`**: Blue - For informational messages

## 🌙 Dark Mode Support

All brand colors automatically adapt to dark mode with brighter variants that maintain readability and contrast. The dark mode colors are defined in the `.dark` section of `globals.css`.

## 🛠️ Technical Details

### Color Format

We use **OKLCH** color format for better color manipulation and consistency:

- **L**: Lightness (0-1)
- **C**: Chroma (saturation, 0-0.4)
- **H**: Hue (0-360 degrees)

### Benefits

1. **Perceptually uniform** - Changes in values correspond to visual changes
2. **Better gradients** - Smooth transitions between colors
3. **Consistent brightness** - Easy to create hover states and variants
4. **Wide color gamut** - Supports modern display capabilities

## 📝 Examples

### Changing to Green/Emerald Brand

```css
:root {
  --brand-primary: oklch(0.65 0.15 140); /* Green */
  --brand-secondary: oklch(0.45 0.1 140); /* Dark green */
}
```

### Changing to Purple/Violet Brand

```css
:root {
  --brand-primary: oklch(0.65 0.2 280); /* Purple */
  --brand-secondary: oklch(0.45 0.15 280); /* Dark purple */
}
```

### Changing to Orange/Amber Brand

```css
:root {
  --brand-primary: oklch(0.7 0.15 50); /* Orange */
  --brand-secondary: oklch(0.5 0.1 50); /* Dark orange */
}
```

All components will automatically use the new colors without any additional changes!
