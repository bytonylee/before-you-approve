import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 4173 },
  preview: { port: 4173 },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/evaluate.test.ts"],
  },
});
