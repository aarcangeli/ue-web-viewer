import eslintJs from "@eslint/js";
import { defineFlatConfig } from "eslint-define-config";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import eslint from "typescript-eslint";

const config = defineFlatConfig([
  {
    name: "Globally ignored files",
    ignores: ["dist", "src/externals"],
  },
  {
    name: "Globally included files",
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
  },
  {
    name: "React settings",
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    name: "Browser globals",
    files: ["src/**"],
    languageOptions: { globals: globals.browser },
  },
  {
    name: "Node.js globals",
    files: ["eslint.config.js"],
    languageOptions: { globals: globals.node },
  },
  {
    name: "@eslint/js/recommended",
    ...eslintJs.configs.recommended,
  },
  ...eslint.configs.recommended,
  {
    name: "eslint-plugin-react/recommended",
    ...reactPlugin.configs.flat.recommended,
  },
  reactRefresh.configs.vite,
  {
    // react-hooks https://react.dev/reference/eslint-plugin-react-hooks
    name: "React rules",
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-hooks/exhaustive-deps": [
        "warn",
        {
          additionalHooks: "useAsyncCompute",
        },
      ],
    },
  },
  {
    name: "Custom rules",
    rules: {
      // Allow the use of `any` in TypeScript
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "error",
      // Enforce strict equality ("===" and "!==")
      eqeqeq: "error",
      // Allow aliasing `this` in TS files
      "@typescript-eslint/no-this-alias": "off",
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
