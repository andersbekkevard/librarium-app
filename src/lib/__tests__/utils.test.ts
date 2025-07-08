import { cn } from "../utils";

describe("Utils", () => {
  describe("cn function", () => {
    it("should combine simple class strings", () => {
      expect(cn("class1", "class2")).toBe("class1 class2");
    });

    it("should handle conditional classes", () => {
      expect(cn("base", true && "conditional")).toBe("base conditional");
      expect(cn("base", false && "conditional")).toBe("base");
    });

    it("should handle undefined and null values", () => {
      expect(cn("base", undefined, null)).toBe("base");
      expect(cn(undefined, "class")).toBe("class");
      expect(cn(null, "class")).toBe("class");
    });

    it("should handle empty strings", () => {
      expect(cn("", "class")).toBe("class");
      expect(cn("class", "")).toBe("class");
      expect(cn("", "")).toBe("");
    });

    it("should handle arrays of classes", () => {
      expect(cn(["class1", "class2"])).toBe("class1 class2");
      expect(cn(["class1", false && "class2", "class3"])).toBe("class1 class3");
    });

    it("should handle objects with boolean values", () => {
      expect(
        cn({
          class1: true,
          class2: false,
          class3: true,
        })
      ).toBe("class1 class3");
    });

    it("should merge conflicting Tailwind classes correctly", () => {
      // twMerge should handle conflicts - later classes override earlier ones
      expect(cn("px-2", "px-4")).toBe("px-4");
      expect(cn("text-sm", "text-lg")).toBe("text-lg");
      expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
    });

    it("should preserve non-conflicting classes when merging", () => {
      expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
      expect(cn("text-sm font-bold", "text-lg")).toBe("font-bold text-lg");
    });

    it("should handle complex combinations", () => {
      const isError = true;
      const isDisabled = false;

      const result = cn(
        "base-class",
        "px-2 py-1",
        {
          "text-red-500": isError,
          "opacity-50": isDisabled,
        },
        isError && "border-red-500",
        "px-4" // This should override px-2
      );

      expect(result).toContain("base-class");
      expect(result).toContain("py-1");
      expect(result).toContain("text-red-500");
      expect(result).toContain("border-red-500");
      expect(result).toContain("px-4");
      expect(result).not.toContain("px-2"); // Should be overridden
      expect(result).not.toContain("opacity-50"); // Should not be included
    });

    it("should handle nested arrays and objects", () => {
      expect(
        cn([
          "class1",
          {
            class2: true,
            class3: false,
          },
          ["class4", "class5"],
        ])
      ).toBe("class1 class2 class4 class5");
    });

    it("should return empty string for no arguments", () => {
      expect(cn()).toBe("");
    });

    it("should return empty string for all falsy arguments", () => {
      expect(cn(false, null, undefined, "")).toBe("");
    });

    it("should handle whitespace properly", () => {
      expect(cn("  class1  ", "  class2  ")).toBe("class1 class2");
    });

    it("should handle duplicate classes", () => {
      expect(cn("class1", "class2", "class1")).toBe("class1 class2 class1");
    });

    it("should work with real Tailwind classes", () => {
      // Test with actual Tailwind utility classes that might conflict
      const result = cn(
        "flex items-center justify-center",
        "p-2 m-2",
        "bg-blue-500 text-white",
        "hover:bg-blue-600",
        "p-4" // Should override p-2
      );

      expect(result).toContain("flex");
      expect(result).toContain("items-center");
      expect(result).toContain("justify-center");
      expect(result).toContain("m-2");
      expect(result).toContain("bg-blue-500");
      expect(result).toContain("text-white");
      expect(result).toContain("hover:bg-blue-600");
      expect(result).toContain("p-4");
      expect(result).not.toContain("p-2");
    });

    it("should handle responsive and variant modifiers correctly", () => {
      const result = cn(
        "text-sm md:text-lg lg:text-xl",
        "dark:text-white",
        "hover:scale-105",
        "focus:outline-none focus:ring-2"
      );

      expect(result).toContain("text-sm");
      expect(result).toContain("md:text-lg");
      expect(result).toContain("lg:text-xl");
      expect(result).toContain("dark:text-white");
      expect(result).toContain("hover:scale-105");
      expect(result).toContain("focus:outline-none");
      expect(result).toContain("focus:ring-2");
    });

    it("should handle component-style class combinations", () => {
      // Simulate how cn might be used in a component
      const baseClasses =
        "inline-flex items-center justify-center rounded-md text-sm font-medium";
      const variantClasses =
        "bg-primary text-primary-foreground hover:bg-primary/90";
      const sizeClasses = "h-10 px-4 py-2";
      const customClasses = "shadow-lg";

      const result = cn(
        baseClasses,
        variantClasses,
        sizeClasses,
        customClasses
      );

      expect(result).toContain("inline-flex");
      expect(result).toContain("items-center");
      expect(result).toContain("justify-center");
      expect(result).toContain("rounded-md");
      expect(result).toContain("bg-primary");
      expect(result).toContain("text-primary-foreground");
      expect(result).toContain("h-10");
      expect(result).toContain("px-4");
      expect(result).toContain("py-2");
      expect(result).toContain("shadow-lg");
    });
  });
});
