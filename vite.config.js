import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "build",
  },
  server: {
    open: true,
    port: 3000,
    host: true,
    proxy: {
      "/api": {
        target: "http://98.70.101.198:8081",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts", // create this file
    include: ["**/*.test.{ts,tsx}"], // pick up your test files
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      clean: false,
      cleanOnRerun: false,
      reportsDirectory: "./coverage",
      exclude: ["**/__tests__/**", "**/mockStore.ts", "**/*.d.ts"],
    },
  },
});
