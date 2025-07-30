import pluginJs from "@eslint/js";
import { defineFlatConfig } from "eslint-define-config";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import eslint from "typescript-eslint";

const config = defineFlatConfig([
  {
    name: "Globally ignored files",
    ignores: ["dist/**", "src/externals/**"],
  },
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  pluginJs.configs.recommended,
  ...eslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  {
    name: "Browser globals",
    files: ["src/**"],
    languageOptions: { globals: globals.browser },
  },
  {
    name: "JavaScript & TypeScript",
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    ...reactPlugin.configs.flat.recommended,
  },
  {
    name: "React hooks",
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
  {
    name: "Node.js globals",
    files: ["eslint.config.js", "scripts/**"],
    languageOptions: { globals: globals.node },
  },
  {
    name: "Custom rules",
    rules: {
      // Allow the use of `any` in TypeScript
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
]);
export default config;

// Dump the config if the --dump flag is passed
if (process.argv.includes("--dump")) {
  // redact plugins to remove circular references
  const withoutPlugins = config.map((c) => {
    const { plugins, ...rest } = c;
    return { plugins: plugins ? Object.keys(plugins) : undefined, ...rest };
  });
  console.log(JSON.stringify(withoutPlugins, null, 2));
}
