/**
 * Shared utility for consistent genre color mapping across charts
 * Ensures identical colors between pie chart and reading activity chart
 * 
 * Color palette inspired by Eden theme - earthy, natural tones
 */

export interface GenreColorMap {
	[genre: string]: string;
}

/**
 * Eden-inspired earthy color palette for genres
 * Uses forest greens, sage, muted blues, and warm accents
 * Colors from ui_inspo: #5C82B5, #789D72, #526D5E, #FEF3C7, #929291, #3C3B39, #576F63, #729D7E, #244633
 */
const GENRE_COLOR_PALETTE = [
	"#244633", // Deep forest green (primary)
	"#789D72", // Sage green
	"#5C82B5", // Muted blue
	"#526D5E", // Dark teal/forest
	"#729D7E", // Light sage
	"#576F63", // Muted forest
	"#8BA888", // Soft sage (derived)
	"#6B8FA3", // Softer blue (derived)
	"#3D5C4A", // Medium forest (derived)
	"#9DB49A", // Pale sage (derived)
	"#7A9BB0", // Light steel blue (derived)
	"#4A6B5A", // Forest mid-tone (derived)
] as const;

/**
 * Special color for "Unknown" genre - warm gray
 */
const UNKNOWN_GENRE_COLOR = "#929291";

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
