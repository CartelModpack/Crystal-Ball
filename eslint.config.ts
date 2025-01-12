import { sheriff, type SheriffSettings, tseslint } from "eslint-config-sheriff";

const sheriffOptions: SheriffSettings = {
  react: false,
  lodash: false,
  remeda: false,
  next: false,
  astro: false,
  playwright: false,
  jest: false,
  vitest: false,
};

export default [
  { ignores: ["eslint.config.ts", "scripts/*"] },
  ...tseslint.config(sheriff(sheriffOptions)),
];
