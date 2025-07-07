// jest.config.js
const nextJest = require("next/jest");

/** Create a Jest config that loads your Next.js config and env files */
const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const customJestConfig = {
  /** Runs after Jest boots, ideal for global mocks and helpers */
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  /** Simulate the browser for React components */
  testEnvironment: "jest-environment-jsdom",

  /** Map your @/ alias the same way Next.js does */
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  /** Coverage settings */
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/app/**/*.{js,jsx,ts,tsx}",
    "!src/components/ui/**/*.{js,jsx,ts,tsx}",
    "!src/components/icons/**/*.{js,jsx,ts,tsx}",
    "!src/components/landing/**/*.{js,jsx,ts,tsx}",
  ],
  coverageThreshold: {
    global: { branches: 70, functions: 70, lines: 70, statements: 70 },
  },

  /** Test file globs */
  testMatch: [
    "**/__tests__/**/*.{js,jsx,ts,tsx}",
    "**/*.{test,spec}.{js,jsx,ts,tsx}",
  ],
};

/** Export the config so next/jest can merge it */
module.exports = createJestConfig(customJestConfig);
