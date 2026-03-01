import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/**/src/__tests__/**/*.test.ts", "apps/**/src/**/__tests__/**/*.test.ts"]
  }
});
