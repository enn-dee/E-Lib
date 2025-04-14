import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
   {
      files: ["**/*.{js,mjs,cjs,ts}"],
      plugins: { js },
      extends: ["js/recommended"],
      rules: {
         "padding-line-between-statements": [
            "error",
            // { blankLine: "always", prev: "*", next: "*" },
            // { blankLine: "any", prev: "import", next: "import" },
         ],
      },
   },
   {
      files: ["**/*.{js,mjs,cjs,ts}"],
      languageOptions: { globals: globals.browser },
   },
   tseslint.configs.recommended,
]);
