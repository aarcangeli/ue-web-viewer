import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

const config = [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    ...reactPlugin.configs.flat.recommended,
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  {
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
export default config;

if (process.argv.includes("--dump")) {
  // redact plugins to remove circular references
  const withoutPlugins = config.map((c) => {
    const { plugins, ...rest } = c;
    return { plugins: plugins ? Object.keys(plugins) : undefined, ...rest };
  });
  console.log(JSON.stringify(withoutPlugins, null, 2));
}
