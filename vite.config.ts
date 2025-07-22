import { codecovVitePlugin } from "@codecov/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import json5Plugin from "vite-plugin-json5";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      useAtYourOwnRisk_mutateSwcOptions(options) {
        // Use stage 3 decorators
        options.jsc!.parser!.decorators = true;
        options.jsc!.transform!.decoratorVersion = "2022-03";
      },
    }),
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
  preview: {
    port: 8080,
  },
  build: {
    sourcemap: true,
  },
});
