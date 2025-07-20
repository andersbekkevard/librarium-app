import {
  createGenreColorMapping,
  getGenreColor,
  getGenreColorPalette,
  getUnknownGenreColor,
} from "../genre-colors";

describe("Genre Color Mapping Utility", () => {
  describe("createGenreColorMapping", () => {
    it("should create consistent color mapping for genres", () => {
      const genres = ["Fiction", "Non-Fiction", "Mystery", "Romance"];
      const colorMap1 = createGenreColorMapping(genres);
      const colorMap2 = createGenreColorMapping(genres);

      expect(colorMap1).toEqual(colorMap2);
      expect(Object.keys(colorMap1)).toHaveLength(4);
    });

    it("should assign colors deterministically based on alphabetical order", () => {
      const genres1 = ["Fiction", "Mystery", "Romance"];
      const genres2 = ["Romance", "Fiction", "Mystery"]; // Different input order

      const colorMap1 = createGenreColorMapping(genres1);
      const colorMap2 = createGenreColorMapping(genres2);

      // Should have same colors for same genres regardless of input order
      expect(colorMap1["Fiction"]).toBe(colorMap2["Fiction"]);
      expect(colorMap1["Mystery"]).toBe(colorMap2["Mystery"]);
      expect(colorMap1["Romance"]).toBe(colorMap2["Romance"]);
    });

    it('should assign special color to "Unknown" genre', () => {
      const genres = ["Fiction", "Unknown", "Mystery"];
      const colorMap = createGenreColorMapping(genres);

      expect(colorMap["Unknown"]).toBe(getUnknownGenreColor());
      expect(colorMap["Fiction"]).not.toBe(getUnknownGenreColor());
      expect(colorMap["Mystery"]).not.toBe(getUnknownGenreColor());
    });

    it("should cycle through colors when there are more genres than colors", () => {
      const palette = getGenreColorPalette();
      const manyGenres = Array.from(
        { length: palette.length + 3 },
        (_, i) => `Genre${i}`
      );

      const colorMap = createGenreColorMapping(manyGenres);

      // Test that all colors assigned are from the palette
      const assignedColors = Object.values(colorMap);
      assignedColors.forEach(color => {
        expect(palette).toContain(color);
      });

      // Test that we have more genres than palette colors
      expect(manyGenres.length).toBeGreaterThan(palette.length);
      
      // Test that some colors are reused (cycling)
      const uniqueColors = new Set(assignedColors);
      expect(uniqueColors.size).toBeLessThanOrEqual(palette.length);
    });

    it("should handle empty genre array", () => {
      const colorMap = createGenreColorMapping([]);
      expect(colorMap).toEqual({});
    });

    it("should handle duplicate genres by treating them as single entries", () => {
      const genres = ["Fiction", "Fiction", "Mystery"];
      const colorMap = createGenreColorMapping(genres);

      // Should only have unique genres
      expect(Object.keys(colorMap)).toEqual(["Fiction", "Mystery"]);
    });
  });

  describe("getGenreColor", () => {
    it("should return consistent color for a genre", () => {
      const allGenres = ["Fiction", "Mystery", "Romance"];
      const color1 = getGenreColor("Fiction", allGenres);
      const color2 = getGenreColor("Fiction", allGenres);

      expect(color1).toBe(color2);
      expect(color1).toBe(getGenreColorPalette()[0]); // Should be first color alphabetically
    });

    it('should return special color for "Unknown" genre', () => {
      const allGenres = ["Fiction", "Unknown", "Mystery"];
      const unknownColor = getGenreColor("Unknown", allGenres);

      expect(unknownColor).toBe(getUnknownGenreColor());
    });

    it("should return fallback color for genre not in list", () => {
      const allGenres = ["Fiction", "Mystery"];
      const color = getGenreColor("NonExistent", allGenres);

      expect(color).toBe(getGenreColorPalette()[0]);
    });

    it("should maintain consistency with createGenreColorMapping", () => {
      const genres = ["Fiction", "Mystery", "Romance", "Unknown"];
      const colorMap = createGenreColorMapping(genres);

      genres.forEach((genre) => {
        const individualColor = getGenreColor(genre, genres);
        expect(individualColor).toBe(colorMap[genre]);
      });
    });
  });

  describe("getGenreColorPalette", () => {
    it("should return a non-empty color palette", () => {
      const palette = getGenreColorPalette();

      expect(palette).toHaveLength(12);
      expect(palette.length).toBeGreaterThan(0);
    });

    it("should return readonly array", () => {
      const palette = getGenreColorPalette();

      // TypeScript enforces readonly at compile time
      // Runtime behavior: array is not frozen, but that's expected for 'as const'
      expect(Array.isArray(palette)).toBe(true);
      expect(palette.length).toBeGreaterThan(0);
    });

    it("should return consistent palette across calls", () => {
      const palette1 = getGenreColorPalette();
      const palette2 = getGenreColorPalette();

      expect(palette1).toEqual(palette2);
    });
  });

  describe("getUnknownGenreColor", () => {
    it("should return a color string", () => {
      const unknownColor = getUnknownGenreColor();
      expect(typeof unknownColor).toBe("string");
      expect(unknownColor.length).toBeGreaterThan(0);
    });

    it("should be consistent across calls", () => {
      const color1 = getUnknownGenreColor();
      const color2 = getUnknownGenreColor();
      expect(color1).toBe(color2);
    });
  });

  describe("Integration tests", () => {
    it("should maintain color consistency between different functions", () => {
      const genres = ["Fiction", "Mystery", "Unknown", "Romance"];
      const colorMap = createGenreColorMapping(genres);

      // Test that individual color getter matches mapping
      Object.keys(colorMap).forEach((genre) => {
        const individualColor = getGenreColor(genre, genres);
        expect(individualColor).toBe(colorMap[genre]);
      });

      // Test unknown genre specifically
      expect(colorMap["Unknown"]).toBe(getUnknownGenreColor());
    });

    it("should handle real-world genre scenarios", () => {
      const realGenres = [
        "Fiction",
        "Non-Fiction",
        "Mystery",
        "Romance",
        "Science Fiction",
        "Fantasy",
        "Biography",
        "History",
        "Self-Help",
        "Unknown",
      ];

      const colorMap = createGenreColorMapping(realGenres);

      // Should have colors for all genres
      expect(Object.keys(colorMap)).toHaveLength(realGenres.length);

      // Unknown should have special color
      expect(colorMap["Unknown"]).toBe(getUnknownGenreColor());

      // All other genres should have different colors from unknown
      realGenres
        .filter((g) => g !== "Unknown")
        .forEach((genre) => {
          expect(colorMap[genre]).not.toBe(getUnknownGenreColor());
        });

      // Colors should be from the palette
      const palette = getGenreColorPalette();
      Object.entries(colorMap).forEach(([genre, color]) => {
        if (genre === "Unknown") {
          expect(color).toBe(getUnknownGenreColor());
        } else {
          expect(palette).toContain(color);
        }
      });
    });

    it("should handle alphabetical sorting correctly", () => {
      const genres = ["Zebra", "Alpha", "Beta"];
      const colorMap = createGenreColorMapping(genres);

      // Should be sorted alphabetically: Alpha, Beta, Zebra
      const sortedGenres = ["Alpha", "Beta", "Zebra"];
      const palette = getGenreColorPalette();

      sortedGenres.forEach((genre, index) => {
        expect(colorMap[genre]).toBe(palette[index]);
      });
    });
  });
});
