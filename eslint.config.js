import globals from "globals";
import pluginJs from "@eslint/js";
import eslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

const config = [
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
    name: "Disabled rules",
    rules: {
      // Allow the use of `any` in TypeScript
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    name: "Node.js globals",
    files: ["eslint.config.js", "scripts/**"],
    languageOptions: { globals: globals.node },
  },
];
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
