import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import * as parser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
 js.configs.recommended,
  ...compat.extends("next/core-web-vitals"),
  {
    files: ["**/*.ts", "**/*.tsx"], // Apply only to TypeScript files
    languageOptions: {
      parser,
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
    },
    rules: {
      ...typescriptPlugin.configs["eslint-recommended"].rules,
      ...typescriptPlugin.configs["recommended"].rules,
      "@typescript-eslint/no-explicit-any": "error", // Or "warn" if you prefer
    },
  },
];

export default eslintConfig;