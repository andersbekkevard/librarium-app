/**
 * Shared utility for consistent genre color mapping across charts
 * Ensures identical colors between pie chart and reading activity chart
 */

export interface GenreColorMap {
	[genre: string]: string;
}

/**
 * Brand-inspired color palette with better contrast - alternating between light and dark
 * Extracted from the existing pie chart implementation to maintain consistency
 */
const GENRE_COLOR_PALETTE = [
	"oklch(0.55 0.25 240)", // Brand primary - vibrant blue (medium)
	"oklch(0.35 0.12 225)", // Very dark blue-grey (dark)
	"oklch(0.75 0.18 250)", // Light purple-blue (light)
	"oklch(0.45 0.15 230)", // Deep blue (medium-dark)
	"oklch(0.8 0.15 245)", // Very light blue (very light)
	"oklch(0.4 0.05 220)", // Brand secondary - dark blue-grey (dark)
	"oklch(0.7 0.2 240)", // Brand accent - light blue (light)
	"oklch(0.3 0.08 220)", // Almost black blue-grey (very dark)
	"oklch(0.85 0.1 240)", // Pale blue (very light)
	"oklch(0.5 0.18 235)", // Darker medium blue (medium)
	"oklch(0.6 0.08 220)", // Medium blue-grey (medium-dark)
	"oklch(0.65 0.22 240)", // Medium blue (medium-light)
] as const;

/**
 * Special color for "Unknown" genre - light grey
 */
const UNKNOWN_GENRE_COLOR = "oklch(0.85 0.01 240)";

/**
 * Creates a consistent color mapping for genres
 * @param genres Array of genre names to assign colors to
 * @returns Object mapping genre names to their assigned colors
 */
export function createGenreColorMapping(genres: string[]): GenreColorMap {
	const colorMap: GenreColorMap = {};

	// Sort genres alphabetically for deterministic color assignment
	const sortedGenres = [...genres].sort();

	sortedGenres.forEach((genre, index) => {
		if (genre === "Unknown") {
			colorMap[genre] = UNKNOWN_GENRE_COLOR;
		} else {
			// Cycle through the color palette for consistent assignment
			colorMap[genre] = GENRE_COLOR_PALETTE[index % GENRE_COLOR_PALETTE.length];
		}
	});

	return colorMap;
}

/**
 * Gets the color for a specific genre using the same logic as createGenreColorMapping
 * Useful for getting individual genre colors without creating the full mapping
 * @param genre The genre name
 * @param allGenres All available genres (for consistent ordering)
 * @returns The color string for the genre
 */
export function getGenreColor(genre: string, allGenres: string[]): string {
	if (genre === "Unknown") {
		return UNKNOWN_GENRE_COLOR;
	}

	// Sort genres alphabetically for deterministic ordering
	const sortedGenres = [...allGenres].sort();
	const index = sortedGenres.indexOf(genre);

	if (index === -1) {
		// Fallback to first color if genre not found
		return GENRE_COLOR_PALETTE[0];
	}

	return GENRE_COLOR_PALETTE[index % GENRE_COLOR_PALETTE.length];
}

/**
 * Gets all available colors from the palette
 * @returns Array of all color strings in the palette
 */
export function getGenreColorPalette(): readonly string[] {
	return GENRE_COLOR_PALETTE;
}

/**
 * Gets the special color used for "Unknown" genre
 * @returns The color string for unknown genre
 */
export function getUnknownGenreColor(): string {
	return UNKNOWN_GENRE_COLOR;
}