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
This project has undergone major scaling over the past week. When implementing functionality quickly, technical debt can easily arise—whether from poor implementation practices, architectural issues, inconsistency, general bloat, or a lack of centralization.

Your task is to search the entire codebase and identify any technical debt or related issues that we should address, and propose fixes for them. The project should be scalable, but not overengineered. This is a startup-scale project, not enterprise-grade with unnecessary architectural bloat. The ideal project is lean, concise, has clear separation of concerns, and emphasizes great reuse and centralization throughout the codebase.

## Test philosophy
Testing ui directly, that is testing html, expecting different tailwind classes, etc etc is not necessary. The ui is iterated so oftenly, so that these tests are irrelevant. It is also obvious for me to see it if the css in the ui has broken, or something has an incorrect color.