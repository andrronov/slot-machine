import baseConfig from "./codestyle/config-eslint/base.js";

export default [
  {
    name: "app/files-to-lint",
    files: ["**/*.{js,vue}"],
  },

  {
    name: "app/files-to-ignore",
    ignores: ["**/dist/**"],
  },

  {
    rules: {
      ...baseConfig.rules,
    },
  },
];
