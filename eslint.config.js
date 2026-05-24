import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import vueTsEslintConfig from "@vue/eslint-config-typescript";
import eslintPluginImportX from "eslint-plugin-import-x";
import pluginVue from "eslint-plugin-vue";
import baseConfig from "./codestyle/config-eslint/base.js";

export default [
  {
    name: "app/files-to-lint",
    files: ["**/*.{ts,mts,tsx,vue}"],
  },

  ...pluginVue.configs["flat/strongly-recommended"],
  ...vueTsEslintConfig(),

  {
    plugins: {
      "import-x": eslintPluginImportX,
    },

    rules: {
      ...baseConfig.rules,

      "no-unused-expressions": "off",
      "max-lines": "off",
      "sort-imports": "off",

      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-implicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",

      "import-x/no-self-import": "error",
      "import-x/no-cycle": "error",
      "vue/multi-word-component-names": "off",
      "vue/no-unused-emit-declarations": "error",
    },
  },

  skipFormatting,
];
