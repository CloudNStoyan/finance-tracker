import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  verbose: true,
  testPathIgnorePatterns: ["out", "node_modules"],
  testEnvironment: "jsdom",
  testRegex: ["/__tests__/.*test.[jt]sx?$"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
    "\\.(svg)$": "<rootDir>/fileTransformer.js",
  },
};
export default config;
