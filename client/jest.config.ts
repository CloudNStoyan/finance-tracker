import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  verbose: true,
  testPathIgnorePatterns: ["out", "node_modules"],
  testEnvironment: "jsdom",
  testRegex: ["/__tests__/.*test.[jt]sx?$"],
};
export default config;
