import { defineConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default defineConfig({
  ...viteConfig,
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
    coverage: {
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["node_modules", "__tests__"],
    },
  },
});
