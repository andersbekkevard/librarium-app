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


## Identify technical bloat
this project has gone through major scaling the past week. when implementing functionality quickly technical debt can easily
arise. either from bad implementation practice and architecture, inconsistency, general bloat and lacking centralization etc.

your task is to search the entire codebase and identify any technical debt and such issues with the current codebase that we
ought to fix, and propose a fix for it. the project shall be scaleable, but shouldnt be overengineered. this is a startup scale
project, not enterprise grade with uneccesary architectural bloat. the ideal project is lean, concise, clear separation of
concern, and great reuse and centralization in the codebase