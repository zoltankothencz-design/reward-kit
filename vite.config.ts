import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // The live demo is served from /reward-kit/ on GitHub Pages; everywhere else the base is /.
  base: process.env.VITE_BASE ?? "/",
  plugins: [react()],
  server: { port: 5183, strictPort: true },
});
