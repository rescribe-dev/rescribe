module.exports = {
  "trailingComma": "es5",
  "singleQuote": true,
  "requirePragma": true,
  "semi": true,
  "overrides": [{
    "files": [
      "src/**/*.ts",
      "__tests__/**/*.ts"
    ],
    "excludeFiles": [
      "src/grammar/grammars/**/*",
      "src/grammar/gen/**/*"
    ]
  }]
};
