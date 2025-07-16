import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";

export const ToggleTheme = () => {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      size="sm"
      variant="ghost"
      className="w-9 h-9 p-0"
    >
      <div className="flex gap-2 dark:hidden">
        <Moon className="size-5" />
      </div>

      <div className="dark:flex gap-2 hidden">
        <Sun className="size-5" />
      </div>

      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
