import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      "@mirzaian/scroll-date-indicator/react": path.resolve(__dirname, "../src/react.ts"),
      "@mirzaian/scroll-date-indicator/presets": path.resolve(__dirname, "../src/presets.ts"),
      "@mirzaian/scroll-date-indicator": path.resolve(__dirname, "../src/index.ts"),
    },
  },
});
