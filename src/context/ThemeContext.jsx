import { createContext, useContext, useEffect, useState } from "react";

/**
 * 1. THEME CONSTANTS
 * Defining string constants avoids typos (e.g. typing "drk" instead of "dark").
 */
// eslint-disable-next-line react-refresh/only-export-components
export const Theme = {
  LIGHT: "light",
  DARK: "dark",
};

/**
 * 2. CONTEXT CREATION
 * createContext creates a global data pipeline.
 * We supply default fallback values for autocompletion and safety.
 * Default is now LIGHT mode as requested.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext({
  theme: Theme.LIGHT,
  toggleTheme: () => {},
});

/**
 * 3. THEME PROVIDER COMPONENT
 * Wraps our application tree and supplies the theme state to all children.
 * 
 * - `useState(Theme.LIGHT)`: Defaults application to Light mode.
 * - `useEffect(...)`: Syncs the theme class directly onto `<html class="light">` or `<html class="dark">`
 *   so CSS variables in index.css take effect immediately across all components.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(Theme.LIGHT);

  // Sync DOM whenever `theme` changes
  useEffect(() => {
    const rootElement = document.documentElement; // <html> element
    rootElement.classList.remove(Theme.LIGHT, Theme.DARK);
    rootElement.classList.add(theme);
  }, [theme]);

  // Toggle between LIGHT and DARK
  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT,
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * 4. CUSTOM HOOK: useTheme
 * Simplifies consuming ThemeContext in any component:
 *   const { theme, toggleTheme } = useTheme();
 * 
 * Includes an error check so developers get a clear message if they accidentally
 * call `useTheme()` outside a `<ThemeProvider>`.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
