import js from "@eslint/js";
import * as tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import playwright from "eslint-plugin-playwright";

const isCI = process.env.CI === "true";

export default [
  {
    ignores: [
      "node_modules",
      "build",
      "dist",
      "coverage",
      ".vite",
      ".vercel",
      ".cache",
      "public/*",
      "app/graphql/generated.ts",
      "fly.toml",
        "Dockerfile",
        "*.config.*",
        ".react-router/*",
    ],
  },

  js.configs.recommended,

  ...tseslint.configs.recommendedTypeChecked.map((c) => ({
    ...c,
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      ...c.languageOptions,
      parserOptions: {
        ...c.languageOptions?.parserOptions,
        project: ["./tsconfig.json"],
        tsconfigRootDir: new URL(".", import.meta.url).pathname,
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...c.languageOptions?.globals,
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
      },
    },
  })),

  {
    files: ["**/*.tsx", "**/*.ts"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...(reactPlugin.configs.recommended?.rules ?? {}),
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",

      ...reactHooks.configs.recommended.rules,
      ...(jsxA11y.configs.recommended?.rules ?? {}),

      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
      "unused-imports/no-unused-imports": isCI ? "error" : "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports" },
      ],
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/no-floating-promises": "error",
    },
  },
  {
    files: [
      "vite.config.*",
      "react-router.config.*",
      "eslint.config.*",
      "playwright.config.*",
      "codegen.ts",
      "Dockerfile",
      "fly.toml",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        URL: "readonly",
        process: "readonly",
        __dirname: "readonly",
        module: "readonly",
        require: "readonly",
      },
    },
    rules: {},
  },

  {
    files: ["tests/**/*.ts", "tests/**/*.tsx"],
    plugins: { playwright },
    ...(playwright.configs?.["flat/recommended"] || {}),
  },
];
