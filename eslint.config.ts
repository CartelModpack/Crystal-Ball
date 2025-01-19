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
  {
    ignores: [
      "eslint.config.ts",
      "scripts/*",
      "site/*",
      "docs/*",
      "bin/*",
      "lib/*",
      "src/lib/*",
    ],
  },
  ...tseslint.config(sheriff(sheriffOptions), {
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/switch-exhaustiveness-check": [
        "error",
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          considerDefaultExhaustiveForUnions: true,
        },
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase"],
          leadingUnderscore: "forbid",
          trailingUnderscore: "forbid",
        },
        {
          selector: "variable",
          format: ["camelCase", "PascalCase"],
          modifiers: ["const"],
          leadingUnderscore: "forbid",
          trailingUnderscore: "forbid",
        },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE"],
          modifiers: ["const"],
          types: ["string", "number"],
          leadingUnderscore: "forbid",
          trailingUnderscore: "forbid",
        },
        {
          selector: "objectLiteralProperty",
          format: null,
          leadingUnderscore: "allowSingleOrDouble",
          trailingUnderscore: "forbid",
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
          leadingUnderscore: "forbid",
          trailingUnderscore: "forbid",
        },
        {
          selector: "variable",
          types: ["boolean"],
          format: ["PascalCase"],
          prefix: ["is", "are", "has", "should", "can"],
          leadingUnderscore: "forbid",
          trailingUnderscore: "forbid",
        },
        { selector: "variable", modifiers: ["destructured"], format: null },
        { selector: "typeProperty", format: null },
        {
          selector: ["variable", "function"],
          types: ["function"],
          format: ["camelCase", "PascalCase"],
          leadingUnderscore: "forbid",
          trailingUnderscore: "forbid",
        },
      ],
      "jsdoc/require-description-complete-sentence": "off",
      "no-restricted-syntax": [
        "error",
        {
          selector: "LabeledStatement",
          message:
            "Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.\n\nIndex: 0.",
        },
        {
          selector: "ForInStatement",
          message:
            "for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.\n\nIndex: 1.",
        },
        {
          selector: "Identifier[name='Reflect']",
          message:
            "Avoid the Reflect API. It is a very low-level feature that has only rare and specific use-cases if building complex and hacky libraries. There is no need to use this feature for any kind of normal development.\n\nIndex: 2.",
        },
        {
          selector: "Identifier[name='Proxy']",
          message: "Avoid Proxy.\n\nIndex: 3.",
        },
        {
          selector: "BinaryExpression[operator='in']",
          message:
            "Avoid the 'in' operator. In real-world scenarios there is rarely a need for this operator. For most usecases, basic property access is all you need. For every other case, use the Object.hasOwn() or the Object.prototype.hasOwnProperty() method. In the really niche cases where you actually need to check for the existence of a property both in the object itself AND in it's prototype chain, feel free to disable this rule with the inline eslint-disable syntax.\n\nIndex: 4.",
        },
        {
          selector: "PropertyDefinition[accessibility='public']",
          message:
            "Avoid access modifiers. In Javascript modules there is no need to limit developer access to properties.\n\nIndex: 5.",
        },
        {
          selector: "PropertyDefinition[accessibility='protected']",
          message:
            "Avoid access modifiers. In Javascript modules there is no need to limit developer access to properties.\n\nIndex: 6.",
        },
        {
          selector: "PropertyDefinition[accessibility='private']",
          message:
            "Avoid access modifiers. In Javascript modules there is no need to limit developer access to properties.\n\nIndex: 7.",
        },
        {
          selector: "Identifier[name='PropTypes']",
          message: "Avoid PropTypes. Use Typescript instead.\n\nIndex: 8.",
        },
        {
          selector: "Identifier[name='propTypes']",
          message: "Avoid PropTypes. Use Typescript instead.\n\nIndex: 9.",
        },
        {
          selector: "UnaryExpression[operator='delete']",
          message:
            'Avoid the "delete" operator. Use omit() instead.\n\nIndex: 10.',
        },
        {
          selector: "TSEnumDeclaration",
          message: "Avoid enums.\n\nIndex: 11.",
        },
        {
          selector: "ClassDeclaration[superClass.name!='Error']",
          message:
            "Avoid classes unless extending Error. Use functions and objects instead.\n\nIndex: 12.",
        },
        {
          selector: "ClassExpression",
          message:
            "Avoid classes unless extending Error. Use functions and objects instead.\n\nIndex: 13.",
        },
      ],
      "unicorn/prefer-top-level-await": 0,
    },
  }),
];
