import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import json5Plugin from "vite-plugin-json5";
import tsconfigPaths from "vite-tsconfig-paths";
import { codecovVitePlugin } from "@codecov/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    json5Plugin(),
    tsconfigPaths(),
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "ue-web-viewer",
      uploadToken: process.env.CODECOV_TOKEN,
      gitService: "github",
    }),
  ],
  base: "",
  server: {
    port: 3000,
  },
  build: {
    sourcemap: true,
  },
});
