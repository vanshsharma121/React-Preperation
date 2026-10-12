import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

// Emulate __dirname in modern ESM environments
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite Configuration
 * 
 * Includes:
 * 1. React Fast Refresh plugin
 * 2. `@/` path alias for cleaner absolute imports (e.g. `@/Components/...`)
 * 3. Consistent dev server port and local network host sharing
 * 
 * https://vite.dev/config/
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Shorthand alias to reference files directly from the src folder
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,        // Preferred local dev server port
    strictPort: false, // Fall back to next port if 5173 is occupied
    open: false,       // Do not force-open a new browser tab on each server restart
    host: true,        // Expose to local network (e.g. test on mobile devices on the same Wi-Fi)
  },
});
