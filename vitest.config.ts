import { defineConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default defineConfig({
  ...viteConfig,
  test: {
    coverage: {
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["node_modules", "__tests__"],
    },
  },
});
