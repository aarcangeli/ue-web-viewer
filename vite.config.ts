import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import json5Plugin from "vite-plugin-json5";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), json5Plugin(), tsconfigPaths()],
  base: "/ue-web-viewer",
  server: {
    port: 3000,
  },
  build: {
    sourcemap: true,
  },
});
