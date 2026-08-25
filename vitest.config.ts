import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // "server-only" resolves its "react-server" export condition to a
      // no-op and everything else to a file that unconditionally throws.
      // Vitest never sets that condition, so without this alias any module
      // that imports "server-only" (correctly, per Next.js convention)
      // would throw the instant a test imports it — even though tests run
      // in a server-like Node context, never an actual client bundle.
      "server-only": path.resolve(__dirname, "./node_modules/server-only/empty.js"),
    },
  },
});
