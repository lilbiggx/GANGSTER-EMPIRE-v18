import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// TEST TOOLS build flag.
// VITE_ENABLE_TEST_TOOLS defaults to "true" because the Render site is currently a TEST build: the wrench icon in
// More opens the Test Tools panel. For a public release build with VITE_ENABLE_TEST_TOOLS=false (set it in the
// Render environment, or `VITE_ENABLE_TEST_TOOLS=false npm run build`). __GE_TEST_TOOLS__ then becomes the literal
// `false`, so the panel, engine/testTools.ts (every cheat handler), test presets and the clock warp are all
// tree-shaken out of the bundle. It is a vite `define` rather than a committed .env.production because .env*
// files are never committed in this repo.
const TEST_TOOLS = (process.env.VITE_ENABLE_TEST_TOOLS ?? "true").trim().toLowerCase() === "true";

export default defineConfig(() => ({
  define: { __GE_TEST_TOOLS__: JSON.stringify(TEST_TOOLS) },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
  },
}));
