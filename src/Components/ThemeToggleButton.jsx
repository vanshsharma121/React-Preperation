import { Moon, Sun } from "lucide-react";
import { useTheme, Theme } from "../context/ThemeContext";

/**
 * ThemeToggleButton Component
 * 
 * Consumes the global `useTheme` hook to read the active theme and trigger toggling.
 * Uses scalable Lucide SVG icons (Moon & Sun) for crisp rendering.
 */
export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === Theme.LIGHT;

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
    >
      {isLight ? <Moon size={16} /> : <Sun size={16} />}
      <span>{isLight ? "Dark" : "Light"}</span>
    </button>
  );
}
