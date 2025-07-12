# Prompts

## Extract Colors
In this codebase, we are using a centralized color system, where all color constants
are defined in colors.ts. There have recently crept in some hard coded colors.
Search the codebase for hard coded tailwind colors, both  e.g. "yellow", but also
color strings like "bg-brand-primary". All of these are to be replaced with a constant reference to colors.ts.
If there are colors not available in colors.ts that you need for consistent apperance, you may refactor colors.ts to adapt.

## Extract Constants
In this codebase, we are using centralized constants, where all important constants
are defined in constants.ts. There have recently crept in some hard coded constants. Search the codebase for hard coded constants that should be extracted to a central file, and extract them.