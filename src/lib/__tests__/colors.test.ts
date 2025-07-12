import * as colors from "../colors";

describe("colors", () => {
  describe("BRAND_CLASSES", () => {
    it("should have correct structure for primary brand classes", () => {
      expect(colors.BRAND_CLASSES.primary).toEqual({
        bg: "bg-brand-primary",
        bgHover: "hover:bg-brand-primary-hover",
        text: "text-brand-primary",
        border: "border-brand-primary",
      });
    });

    it("should have correct structure for secondary brand classes", () => {
      expect(colors.BRAND_CLASSES.secondary).toEqual({
        bg: "bg-brand-secondary",
        bgHover: "hover:bg-brand-secondary-hover",
        text: "text-brand-secondary",
        border: "border-brand-secondary",
      });
    });

    it("should have correct structure for accent brand classes", () => {
      expect(colors.BRAND_CLASSES.accent).toEqual({
        bg: "bg-brand-accent",
        bgHover: "hover:bg-brand-accent-hover",
        text: "text-brand-accent",
        border: "border-brand-accent",
      });
    });

    it("should be a const object", () => {
      // TypeScript will enforce this at compile time, but we can test immutability
      expect(() => {
        // @ts-expect-error - Testing runtime immutability
        colors.BRAND_CLASSES.primary =
          {} as typeof colors.BRAND_CLASSES.primary;
      }).toThrow(TypeError);
    });

    it("should have all expected brand color keys", () => {
      const expectedKeys = ["primary", "secondary", "accent"];
      expect(Object.keys(colors.BRAND_CLASSES)).toEqual(expectedKeys);
    });

    it("should have consistent structure across all brand colors", () => {
      const expectedProperties = ["bg", "bgHover", "text", "border"];

      Object.values(colors.BRAND_CLASSES).forEach((brandColor) => {
        expect(Object.keys(brandColor)).toEqual(expectedProperties);
      });
    });
  });

  describe("STATUS_CLASSES", () => {
    it("should have correct structure for success status classes", () => {
      expect(colors.STATUS_CLASSES.success).toEqual({
        bg: "bg-status-success",
        text: "text-status-success",
        border: "border-status-success",
      });
    });

    it("should have correct structure for warning status classes", () => {
      expect(colors.STATUS_CLASSES.warning).toEqual({
        bg: "bg-status-warning",
        text: "text-status-warning",
        border: "border-status-warning",
      });
    });

    it("should have correct structure for error status classes", () => {
      expect(colors.STATUS_CLASSES.error).toEqual({
        bg: "bg-status-error",
        text: "text-status-error",
        border: "border-status-error",
      });
    });

    it("should have correct structure for info status classes", () => {
      expect(colors.STATUS_CLASSES.info).toEqual({
        bg: "bg-status-info",
        text: "text-status-info",
        border: "border-status-info",
      });
    });

    it("should be a const object", () => {
      // TypeScript will enforce this at compile time, but we can test immutability
      expect(() => {
        // @ts-expect-error - Testing runtime immutability
        colors.STATUS_CLASSES.success =
          {} as typeof colors.STATUS_CLASSES.success;
      }).toThrow(TypeError);
    });

    it("should have all expected status color keys", () => {
      const expectedKeys = ["success", "warning", "error", "info"];
      expect(Object.keys(colors.STATUS_CLASSES)).toEqual(expectedKeys);
    });

    it("should have consistent structure across all status colors", () => {
      const expectedProperties = ["bg", "text", "border"];

      Object.values(colors.STATUS_CLASSES).forEach((statusColor) => {
        expect(Object.keys(statusColor)).toEqual(expectedProperties);
      });
    });

    it("should not have hover variants for status colors", () => {
      Object.values(colors.STATUS_CLASSES).forEach((statusColor) => {
        expect(statusColor).not.toHaveProperty("bgHover");
      });
    });
  });

  describe("READING_STATE_COLORS", () => {
    it("should map not_started to info status", () => {
      expect(colors.READING_STATE_COLORS.not_started).toEqual(
        colors.STATUS_CLASSES.info
      );
    });

    it("should map in_progress to primary brand", () => {
      expect(colors.READING_STATE_COLORS.in_progress).toEqual(
        colors.BRAND_CLASSES.primary
      );
    });

    it("should map finished to success status", () => {
      expect(colors.READING_STATE_COLORS.finished).toEqual(
        colors.STATUS_CLASSES.success
      );
    });

    it("should be a const object", () => {
      // TypeScript will enforce this at compile time, but we can test immutability
      expect(() => {
        // @ts-expect-error - Testing runtime immutability
        colors.READING_STATE_COLORS.finished =
          {} as typeof colors.READING_STATE_COLORS.finished;
      }).toThrow(TypeError);
    });

    it("should have all expected reading state keys", () => {
      const expectedKeys = ["not_started", "in_progress", "finished"];
      expect(Object.keys(colors.READING_STATE_COLORS)).toEqual(expectedKeys);
    });

    it("should reference existing color objects", () => {
      expect(colors.READING_STATE_COLORS.not_started).toEqual(
        colors.STATUS_CLASSES.info
      );
      expect(colors.READING_STATE_COLORS.in_progress).toEqual(
        colors.BRAND_CLASSES.primary
      );
      expect(colors.READING_STATE_COLORS.finished).toEqual(
        colors.STATUS_CLASSES.success
      );
    });

    it("should provide access to nested color properties", () => {
      expect(colors.READING_STATE_COLORS.not_started.bg).toBe("bg-status-info");
      expect(colors.READING_STATE_COLORS.in_progress.bg).toBe(
        "bg-brand-primary"
      );
      expect(colors.READING_STATE_COLORS.finished.bg).toBe("bg-status-success");
    });
  });

  describe("getCSSVariable", () => {
    it("should return correct CSS variable format", () => {
      expect(colors.getCSSVariable("color-primary")).toBe(
        "var(--color-primary)"
      );
    });

    it("should handle variable names with hyphens", () => {
      expect(colors.getCSSVariable("color-primary-hover")).toBe(
        "var(--color-primary-hover)"
      );
    });

    it("should handle variable names with underscores", () => {
      expect(colors.getCSSVariable("color_primary_hover")).toBe(
        "var(--color_primary_hover)"
      );
    });

    it("should handle simple variable names", () => {
      expect(colors.getCSSVariable("primary")).toBe("var(--primary)");
    });

    it("should handle empty string", () => {
      expect(colors.getCSSVariable("")).toBe("var(--)");
    });

    it("should handle complex variable names", () => {
      expect(colors.getCSSVariable("component-card-background-color")).toBe(
        "var(--component-card-background-color)"
      );
    });

    it("should not modify variable names with existing dashes", () => {
      expect(colors.getCSSVariable("--color-primary")).toBe(
        "var(----color-primary)"
      );
    });

    it("should handle numeric variable names", () => {
      expect(colors.getCSSVariable("color-1")).toBe("var(--color-1)");
    });

    it("should be a pure function", () => {
      const variableName = "test-variable";
      const result1 = colors.getCSSVariable(variableName);
      const result2 = colors.getCSSVariable(variableName);

      expect(result1).toBe(result2);
      expect(result1).toBe("var(--test-variable)");
    });
  });

  describe("default export", () => {
    it("should not have a default export", async () => {
      const colorsModule = await import("../colors");

      expect(colorsModule.default).toBeUndefined();
    });
  });

  describe("integration tests", () => {
    it("should provide consistent color scheme for reading states", () => {
      // Test that reading states use appropriate semantic colors
      expect(colors.READING_STATE_COLORS.not_started.bg).toBe("bg-status-info");
      expect(colors.READING_STATE_COLORS.in_progress.bg).toBe(
        "bg-brand-primary"
      );
      expect(colors.READING_STATE_COLORS.finished.bg).toBe("bg-status-success");
    });

    it("should provide hover variants for interactive elements", () => {
      // Only brand colors should have hover variants
      Object.values(colors.BRAND_CLASSES).forEach((brandColor) => {
        expect(brandColor).toHaveProperty("bgHover");
        expect(brandColor.bgHover).toContain("hover:");
      });

      // Status colors should not have hover variants
      Object.values(colors.STATUS_CLASSES).forEach((statusColor) => {
        expect(statusColor).not.toHaveProperty("bgHover");
      });
    });

    it("should use consistent naming conventions", () => {
      // Test that all class names follow expected patterns
      const allClasses = [
        ...Object.values(colors.BRAND_CLASSES).flatMap(Object.values),
        ...Object.values(colors.STATUS_CLASSES).flatMap(Object.values),
      ];

      allClasses.forEach((className) => {
        expect(className).toMatch(/^(bg|text|border|hover:bg)-/);
      });
    });

    it("should provide CSS variable function for dynamic styling", () => {
      // Test that getCSSVariable can be used with typical CSS variable names
      const typicalVariables = [
        "color-primary",
        "color-secondary",
        "color-accent",
        "color-success",
        "color-warning",
        "color-error",
        "color-info",
      ];

      typicalVariables.forEach((variable) => {
        const result = colors.getCSSVariable(variable);
        expect(result).toBe(`var(--${variable})`);
      });
    });
  });
});
