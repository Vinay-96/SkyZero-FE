// components/ThemeToggle.tsx
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/lib/zustand/theme.store";
import { useEffect } from "react";

export const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();

  // Ensure client-side only execution
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full hover:bg-accent/50 transition-all"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDarkMode}
    >
      {isDarkMode ? (
        <Sun className="h-[1.4rem] w-[1.4rem] rotate-0 scale-100 transition-all text-foreground/80 hover:text-foreground" />
      ) : (
        <Moon className="h-[1.4rem] w-[1.4rem] rotate-0 scale-100 transition-all text-muted-foreground hover:text-foreground" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

