import * as colors from "@/lib/design/colors";

describe("colors", () => {
  describe("BRAND_COLORS", () => {
    it("should have correct structure for primary brand classes", () => {
      expect(colors.BRAND_COLORS.primary).toEqual({
        bg: "bg-brand-primary",
        bgHover: "hover:bg-brand-primary-hover",
        bgLight: "bg-brand-primary/10",
        bgLightDark: "dark:bg-brand-primary/20",
        bgBlur: "bg-brand-primary/50",
        text: "text-brand-primary",
        border: "border-brand-primary",
        borderLight: "border-brand-primary/20",
        borderTop: "border-t-brand-primary/30",
        gradientFrom: "from-brand-primary",
        gradientTo: "to-brand-primary",
      });
    });

    it("should have all expected brand color keys", () => {
      const expectedKeys = ["primary", "secondary", "accent"];
      expect(Object.keys(colors.BRAND_COLORS)).toEqual(expectedKeys);
    });
  });

  describe("STATUS_COLORS", () => {
    it("should have correct structure for success status classes", () => {
      expect(colors.STATUS_COLORS.success).toEqual({
        bg: "bg-status-success",
        bgLight: "bg-status-success/10",
        text: "text-status-success",
        border: "border-status-success",
        borderLight: "border-status-success/20",
        borderLeft: "border-l-status-success",
      });
    });

    it("should have all expected status color keys", () => {
      const expectedKeys = ["success", "warning", "error", "info"];
      expect(Object.keys(colors.STATUS_COLORS)).toEqual(expectedKeys);
    });
  });

  describe("READING_STATE_COLORS", () => {
    it("should map not_started to secondary brand color", () => {
      expect(colors.READING_STATE_COLORS.not_started).toEqual({
        bg: "bg-[var(--secondary)]",
        text: "text-[var(--secondary-foreground)]",
        border: "border-[var(--secondary)]",
      });
    });

    it("should map in_progress to primary brand color with light background", () => {
      expect(colors.READING_STATE_COLORS.in_progress).toEqual({
        bg: "bg-[var(--reading-in-progress-bg)]",
        text: "text-[var(--reading-in-progress-text)]",
        border: "border-[var(--reading-in-progress-border)]",
      });
    });

    it("should map finished to muted color", () => {
      expect(colors.READING_STATE_COLORS.finished).toEqual({
        bg: "bg-[var(--reading-finished-bg)]",
        text: "text-[var(--reading-finished-text)]",
        border: "border-[var(--reading-finished-border)]",
      });
    });
  });

  describe("getCSSVariable", () => {
    it("should return correct CSS variable format", () => {
      expect(colors.getCSSVariable("color-primary")).toBe(
        "var(--color-primary)"
      );
    });
  });
});
