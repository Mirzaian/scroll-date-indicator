import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      "scroll-date-indicator/react": path.resolve(__dirname, "../src/react.ts"),
      "scroll-date-indicator/presets": path.resolve(__dirname, "../src/presets.ts"),
      "scroll-date-indicator": path.resolve(__dirname, "../src/index.ts"),
    },
  },
});
